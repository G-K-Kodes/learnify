// src/components/common/ProtectedRoute.tsx
// src/components/common/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/auth" replace />;
  if (!allowedRoles.includes(role || "")) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default ProtectedRoute;

