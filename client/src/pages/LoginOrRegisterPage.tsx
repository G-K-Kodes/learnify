import React, { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance.ts";

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
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (activeTab === "login") {
        const res = await axiosInstance.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const user = res.data.user;
        const token = res.data.token;

        // Save token & role
        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);
        localStorage.setItem("user", JSON.stringify(user));

        console.log("User:", res.data.user);

        // Redirect based on role & verification
        if (!user.isVerified) {
          setMessage("Please verify your email before logging in.");
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
        setMessage(res.data.message || "Registered successfully!");
        // Optional: Automatically switch to login tab
        setActiveTab("login");
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-semibold text-center text-indigo-600 mb-6">
          {activeTab === "login"
            ? "Welcome Back!"
            : activeTab === "registerStudent"
            ? "Create a Student Account"
            : "Join as an Instructor"}
        </h2>

        {/* Tabs */}
        <div className="flex justify-around mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`px-3 py-2 rounded-md font-medium ${
              activeTab === "login"
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("registerStudent")}
            className={`px-3 py-2 rounded-md font-medium ${
              activeTab === "registerStudent"
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            Student Register
          </button>
          <button
            onClick={() => setActiveTab("registerInstructor")}
            className={`px-3 py-2 rounded-md font-medium ${
              activeTab === "registerInstructor"
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            Become an Instructor
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {(activeTab === "registerStudent" ||
            activeTab === "registerInstructor") && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-300"
          >
            {loading
              ? "Please wait..."
              : activeTab === "login"
              ? "Login"
              : "Register"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}

        {/* Partner Call to Action */}
        {activeTab === "login" && (
          <div className="mt-6 text-center text-gray-600">
            <p>
              Interested in sharing your knowledge?{" "}
              <button
                onClick={() => setActiveTab("registerInstructor")}
                className="text-indigo-600 font-medium hover:underline"
              >
                Join as an Instructor
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginOrRegisterPage;
