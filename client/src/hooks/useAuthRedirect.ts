import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const currentPath = location.pathname;

    const publicPaths = [
      "/",
      "/auth",
      "/verify-email",
      "/password/forgot",
      "/verify-reset-code",
      "/reset-password",
    ];

    // 🚫 Don’t redirect for NotFoundPage or unknown routes
    if (!publicPaths.includes(currentPath) && !token) {
      // if route doesn't match anything known, do NOT redirect
      if (!["/admin", "/instructor", "/student"].some(path => currentPath.startsWith(path))) {
        return;
      }

      // otherwise, protected path → redirect to auth
      navigate("/auth", { replace: true });
    }

    if (token && user) {
      if (!user.isVerified) {
        navigate(`/verify-email?token=${user.verificationToken}`, { replace: true });
      }
    }
  }, [navigate, location]);
};
