import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { useAuthRedirect } from "./hooks/useAuthRedirect";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginOrRegister from "./pages/LoginOrRegisterPage";
import VerifyEmail from "./pages/VerifyEmail";
import PasswordRecoveryFlow from "./pages/PasswordRecoveryFlow"; 
import AdminDashboard from "./pages/AdminDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CourseDetails from "./pages/CourseDetails";
import NotFoundPage from "./pages/NotFoundPage";

const AutoRedirect: React.FC = () => {
  useAuthRedirect();
  return null;
};

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <AutoRedirect />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<LoginOrRegister />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<PasswordRecoveryFlow />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["Instructor"]} />}>
            <Route path="/instructor" element={<InstructorDashboard />} />
            <Route path="/instructor/course/:id" element={<CourseDetails />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["Student"]} />}>
            <Route path="/student" element={<StudentDashboard />} />
          </Route>

          {/* Catch-all Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
