import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const PasswordRecoveryFlow: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(0); // resend code timer

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (timer > 0) {
      countdown = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(countdown);
  }, [timer]);

  // STEP 1: Request reset code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axiosInstance.post("/auth/request-password-reset", { email });
      toast.success(res.data.message || "Reset code sent!");
      setStep(2);
      setTimer(60); // 1-minute timer
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error sending reset code.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify code locally
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    setStep(3);
  };

  // STEP 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/auth/reset-password", {
        email,
        code,
        newPassword,
      });
      toast.success(res.data.message || "Password reset successful!");
      navigate("/auth");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Resend code
  const handleResendCode = async () => {
    if (timer > 0) return;
    try {
      const res = await axiosInstance.post("/auth/request-password-reset", { email });
      toast.success(res.data.message || "Code resent!");
      setTimer(60);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error resending code.");
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-blue-100 to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-slate-900 shadow-xl rounded-2xl w-full max-w-md p-8 relative overflow-hidden"
      >
        {/* Progress bar */}
        <div className="relative mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-2 bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-semibold text-center text-blue-500 mb-6">
                Forgot Password
              </h2>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    Enter your registered email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-slate-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 text-white py-2 rounded-md hover:bg-emerald-600 transition disabled:bg-emerald-300"
                >
                  {loading ? "Sending..." : "Send Reset Code"}
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-semibold text-center text-blue-500 mb-6">
                Verify Reset Code
              </h2>
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <p className="text-gray-400 text-sm text-center mb-2">
                  Enter the 6-digit code sent to <b>{email}</b>.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full border border-slate-700 rounded-md px-3 py-2 text-center text-lg tracking-widest focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  placeholder="______"
                />

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-400 hover:text-amber-400 underline text-sm"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={timer > 0}
                    className="text-blue-500 hover:text-amber-400 underline text-sm disabled:text-gray-400"
                  >
                    {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-white py-2 rounded-md hover:bg-emerald-600 transition"
                >
                  Continue
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-semibold text-center text-blue-500 mb-6">
                Reset Password
              </h2>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full border border-slate-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full border border-slate-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/2 bg-gray-200 py-2 rounded-md hover:bg-gray-300 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-1/2 bg-emerald-500 text-white py-2 rounded-md hover:bg-emerald-600 transition disabled:bg-emerald-300"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PasswordRecoveryFlow;
