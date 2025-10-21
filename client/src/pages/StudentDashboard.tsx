import React from "react";
import { useNavigate } from "react-router-dom";

// Mock data for enrolled courses (replace with API call later)
const mockCourses = [
  { id: 1, title: "React for Beginners", progress: 45 },
  { id: 2, title: "Advanced Node.js", progress: 80 },
  { id: 3, title: "UI/UX Design Fundamentals", progress: 20 },
];

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-indigo-700">
          Welcome, {user.name || "Student"} 👋
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Enrolled Courses */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Courses</h2>
        {mockCourses.length === 0 ? (
          <p className="text-gray-600">You have not enrolled in any courses yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockCourses.map((course) => (
              <div key={course.id} className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                  {course.title}
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="bg-indigo-600 h-4 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-600 mb-2">Progress: {course.progress}%</p>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
                  Continue Learning
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Q&A / Discussions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Discussions / Q&A</h2>
        <p className="text-gray-600">
          Ask questions, engage with instructors, and participate in course discussions.
        </p>
        <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
          Go to Q&A
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;
