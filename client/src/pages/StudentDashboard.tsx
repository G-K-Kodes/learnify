import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  instructor: { name: string; email: string };
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  // 🎓 Fetch student enrollments
  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/courses/my/enrollments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrolledCourses(res.data);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  // 📘 Fetch paginated courses
  const fetchAllCourses = async (pageNum = 1) => {
    try {
      const res = await axiosInstance.get(`/courses?page=${pageNum}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllCourses(res.data.courses || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.page || 1);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  useEffect(() => {
    fetchAllCourses(page);
    fetchEnrollments();
  }, [page]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const handleContinue = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleUnenroll = async (courseId: string) => {
    try {
      await axiosInstance.post(
        `/courses/${courseId}/unenroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEnrollments();
    } catch (err) {
      console.error(err);
      alert("Failed to unenroll. Please try again.");
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(courseId);
      await axiosInstance.post(
        `/courses/${courseId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEnrollments();
      alert("Successfully enrolled in course!");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to enroll. Try again.");
    } finally {
      setEnrolling(null);
    }
  };

  // ✅ Helper to check if student is already enrolled
  const isEnrolled = (courseId: string) =>
    enrolledCourses.some((c) => c._id === courseId);

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
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Your Courses</h2>
        {loading ? (
          <p className="text-gray-600">Loading your courses...</p>
        ) : enrolledCourses.length === 0 ? (
          <p className="text-gray-600">You haven’t enrolled in any courses yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => (
              <div
                key={course._id}
                className="bg-white shadow-md rounded-lg p-6 border-l-4 border-indigo-500"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-2">{course.description}</p>
                <p className="text-gray-500 mb-4">
                  Instructor: {course.instructor?.name || "Unknown"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleContinue(course._id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                  >
                    Continue Learning
                  </button>
                  <button
                    onClick={() => handleUnenroll(course._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                  >
                    Unenroll
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Available Courses */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-indigo-700">
          All Available Courses
        </h2>

        {allCourses.length === 0 ? (
          <p className="text-gray-600">No courses available yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{course.description}</p>
                  <p className="text-gray-500 mb-4">
                    Instructor: {course.instructor?.name || "Unknown"}
                  </p>

                  {isEnrolled(course._id) ? (
                    <button
                      onClick={() => handleContinue(course._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                    >
                      Enrolled ✓
                    </button>
                  ) : (
                    <button
                      disabled={enrolling === course._id}
                      onClick={() => handleEnroll(course._id)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-60"
                    >
                      {enrolling === course._id ? "Enrolling..." : "Enroll"}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                ← Prev
              </button>

              <span className="text-gray-700 font-medium">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
