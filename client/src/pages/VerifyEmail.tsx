import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const VerifyEmail: React.FC = () => {
  const [message, setMessage] = useState("Verifying...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await axiosInstance.get(`/auth/verify-email?token=${token}`);
        setMessage(res.data.message);
        setTimeout(() => navigate("/auth"), 2000); // Redirect to login
      } catch (err: any) {
        setMessage(err.response?.data?.message || "Verification failed.");
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmail;
