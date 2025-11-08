// src/pages/VerifyResetCodePage.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const VerifyResetCodePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";

  const [code, setCode] = useState("");
  const [loading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    navigate("/reset-password", { state: { email, code } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 px-4">
      <div className="bg-slate-900 shadow-xl rounded-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-semibold text-center text-blue-500 mb-6">
          Verify Reset Code
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-2 rounded-md hover:bg-emerald-600 transition disabled:bg-emerald-300"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyResetCodePage;
