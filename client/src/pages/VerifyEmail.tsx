import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      toast.error("Invalid verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await axiosInstance.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(res.data.message || "Your email has been verified!");
        toast.success("Email verified successfully!");

        // ✅ Update local user so AutoRedirect doesn’t loop back here
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          user.isVerified = true;
          delete user.verificationToken;
          localStorage.setItem("user", JSON.stringify(user));
        }

      } catch (err: any) {
        setStatus("error");
        const msg = err.response?.data?.message || "Email verification failed.";
        setMessage(msg);
        toast.error(msg);
      }
    };

    verifyEmail();
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 px-4">
      <div className="bg-slate-900 shadow-lg rounded-2xl p-8 max-w-md text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
            <h2 className="text-lg font-semibold text-gray-300">{message}</h2>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-200">Email Verified!</h2>
            <p className="text-gray-400">{message}</p>
            <button
              onClick={() => navigate("/auth")}
              className="mt-4 px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              Go to Login
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-14 w-14 text-red-500 mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-200">Verification Failed</h2>
            <p className="text-gray-400">{message}</p>
            <button
              onClick={() => navigate("/auth")}
              className="mt-4 px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
            >
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
