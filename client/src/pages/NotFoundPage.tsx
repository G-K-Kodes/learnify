import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import Footer from "../components/layout/Footer";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-800 to-white px-4 text-center">
      <div className="bg-slate-900 shadow-lg rounded-2xl p-10 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-slate-700 rounded-full">
            <GraduationCap className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold text-blue-500 mb-3">404</h1>
        <h2 className="text-2xl font-semibold text-gray-200 mb-2">
          Oops! Page not found
        </h2>
        <p className="text-gray-400 mb-6">
          It looks like the page you’re trying to visit doesn’t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-lg border border-slate-700 text-gray-300 hover:bg-gray-100 transition"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition"
          >
            Return Home
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFoundPage;
