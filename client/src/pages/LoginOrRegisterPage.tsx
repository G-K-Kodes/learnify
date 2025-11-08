import React, { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { useCooldownToast } from "../hooks/useCooldownToast";

type Role = "Student" | "Instructor";
type Tab = "login" | "registerStudent" | "registerInstructor";

interface FormData {
  name?: string;
  email: string;
  password: string;
  role?: Role;
}

const LoginOrRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [showResend, setShowResend] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  // 🔒 Account lock state
  const [isLocked, setIsLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  const { startCooldown, cooldownActive } = useCooldownToast("resendEmail", {
    progress: (r) => `📩 Please wait ${r}s before resending the verification email.`,
    done: "✅ You can now resend the verification email!",
  });

  // 🕓 Poll backend for lock status
  const checkLockStatus = async (email: string) => {
    if (!email) return;
    try {
      const res = await axiosInstance.get(`/auth/lock-status?email=${email}`);
      const { isLocked, remainingTime } = res.data;
      setIsLocked(isLocked);
      setRemainingTime(remainingTime);
    } catch (err) {
      console.error("Lock status check failed", err);
    }
  };

  // Re-check lock whenever email changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (formData.email) checkLockStatus(formData.email);
    }, 600);
    return () => clearTimeout(delayDebounce);
  }, [formData.email]);

  // Countdown effect for lock timer
  useEffect(() => {
    if (!isLocked || remainingTime <= 0) return;
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsLocked(false);
          toast.success("🔓 You can now log in again!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, remainingTime]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLocked) {
      toast.error("Your account is locked. Please wait for the timer to finish.");
      return;
    }

    setLoading(true);

    try {
      if (activeTab === "login") {
        const res = await axiosInstance.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const user = res.data.user;
        const token = res.data.token;

        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success(res.data.message || "Login successful!");

        if (!user.isVerified) {
          toast.error("Please verify your email before logging in.");
        } else if (user.role === "Admin") {
          navigate("/admin");
        } else if (user.role === "Instructor") {
          navigate("/instructor");
        } else {
          navigate("/student");
        }
      } else {
        const role: Role =
          activeTab === "registerInstructor" ? "Instructor" : "Student";
        const res = await axiosInstance.post("/auth/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
        });

        toast.success(res.data.message || "Registered successfully!");
        setActiveTab("login");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Something went wrong.";
      toast.error(msg);

      if (msg.toLowerCase().includes("verify")) {
        setShowResend(true);
      }

      // 🚫 Detect account lock from backend
      if (msg.toLowerCase().includes("locked")) {
        await checkLockStatus(formData.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (cooldownActive) {
      toast.error("⏳ Please wait before resending again.");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/auth/resend-verification", {
        email: formData.email,
      });
      toast.success(res.data.message || "📩 Verification email resent!");
      startCooldown(30);
      setShowResend(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Unable to resend verification email.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ⏳ Circular countdown UI
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = remainingTime > 0 ? (remainingTime / 60) * circumference : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 px-4">
      <div className="bg-slate-900 shadow-xl rounded-2xl w-full max-w-md p-8 relative">
        <h2 className="text-2xl font-semibold text-center text-blue-500 mb-6">
          {activeTab === "login"
            ? "Welcome Back!"
            : activeTab === "registerStudent"
            ? "Create a Student Account"
            : "Join as an Instructor"}
        </h2>

        {isLocked && (
          <div className="flex flex-col items-center mb-6">
            <svg width="100" height="100" className="mb-2">
              <circle
                stroke="#e5e7eb"
                fill="transparent"
                strokeWidth="8"
                r={radius}
                cx="50"
                cy="50"
              />
              <circle
                stroke="#3B82F6"
                fill="transparent"
                strokeWidth="8"
                r={radius}
                cx="50"
                cy="50"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                style={{
                  transition: "stroke-dashoffset 1s linear",
                }}
              />
            </svg>
            <p className="text-gray-300 text-sm font-medium">
              ⏳ Account locked for{" "}
              <span className="text-blue-500 font-semibold">
                {remainingTime}s
              </span>
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-around mb-6">
          {["login", "registerStudent", "registerInstructor"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`px-3 py-2 rounded-md font-medium ${
                activeTab === tab
                  ? "bg-emerald-500 text-white"
                  : "text-gray-400 hover:text-blue-500"
              }`}
            >
              {tab === "login"
                ? "Login"
                : tab === "registerStudent"
                ? "Student Register"
                : "Become an Instructor"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {(activeTab === "registerStudent" ||
            activeTab === "registerInstructor") && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-slate-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLocked}
              className="w-full border border-slate-700 rounded-md px-3 py-2 text-gray-100 placeholder-gray-400 bg-slate-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none disabled:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLocked}
              className="w-full border border-slate-700 rounded-md px-3 py-2 text-gray-100 placeholder-gray-400 bg-slate-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none disabled:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full bg-emerald-500 text-white py-2 rounded-md hover:bg-emerald-600 transition disabled:bg-emerald-300"
          >
            {loading
              ? "Please wait..."
              : activeTab === "login"
              ? "Login"
              : "Register"}
          </button>

          {showResend && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">
                Didn’t get the verification email?{" "}
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={cooldownActive}
                  className={`font-medium ${
                    cooldownActive
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-500 hover:text-amber-400 underline"
                  }`}
                >
                  {cooldownActive ? "Please wait..." : "Resend Email"}
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginOrRegisterPage;
