import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-purple-700">
          Welcome, {user.name || "Admin"} 👋
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Dashboard Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users Section */}
        <div className="bg-slate-900 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-gray-400">
            View and manage all instructors and students.
          </p>
          <button className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600">
            Manage Users
          </button>
        </div>

        {/* Courses Section */}
        <div className="bg-slate-900 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Course Moderation</h2>
          <p className="text-gray-400">
            Approve or review courses uploaded by instructors.
          </p>
          <button className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600">
            Review Courses
          </button>
        </div>

        {/* Analytics Section */}
        <div className="bg-slate-900 shadow-md rounded-lg p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Platform Analytics</h2>
          <p className="text-gray-400">
            View total students, instructors, courses, and enrollment stats.
          </p>
          <button className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
