import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginOrRegister from "./pages/LoginOrRegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import VerifyEmail from "./pages/VerifyEmail";
import CourseDetails from "./pages/CourseDetails";

const AutoRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const currentPath = location.pathname;

    if (token && user) {
      // User is logged in
      if (!user.isVerified) {
        // Unverified users can only go to verify-email
        if (!currentPath.startsWith("/verify-email")) {
          navigate(`/verify-email?token=${user.verificationToken}`, { replace: true });
        }
      } else {
        if (currentPath === "/" || currentPath === "/auth") {
          if (user.role === "Admin") navigate("/admin", { replace: true });
          else if (user.role === "Instructor") navigate("/instructor", { replace: true });
          else navigate("/student", { replace: true });
        }
      }
    } else {
      // Logged-out users
      // They can visit only "/" or "/auth"
      if (currentPath !== "/" && currentPath !== "/auth") {
        navigate("/auth", { replace: true });
      }
    }
  }, [navigate, location]);

  return null;
};

function App() {
  return (
    <Router>
      <AutoRedirect />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<LoginOrRegister />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={["Instructor"]}>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/instructor/course/:id"
          element={
            <ProtectedRoute allowedRoles={["Instructor"]}>
              {<CourseDetails />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/verify-email/:token?" element={<VerifyEmail />} />
      </Routes>
    </Router>
  );
}

export default App;