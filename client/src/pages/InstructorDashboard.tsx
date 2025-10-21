import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import AddCourseForm from "../components/course/AddCourseForm";

interface CourseAnalytics {
  totalViews?: number;
  completionRate?: number;
}

interface Course {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  studentsEnrolled?: { _id: string; name: string; email: string }[];
  analytics?: CourseAnalytics;
}

const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    category: "",
    thumbnail: "",
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/instructor/my-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error(err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axiosInstance.delete(`/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Failed to delete course.");
    }
  };

  const startEditing = (course: Course) => {
    setEditingCourseId(course._id);
    setEditFormData({
      title: course.title ?? "",
      description: course.description ?? "",
      category: course.category ?? "",
      thumbnail: course.thumbnail ?? "",
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!editingCourseId) return;
    try {
      await axiosInstance.put(`/courses/${editingCourseId}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingCourseId(null);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Failed to update course.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-green-700">
          Welcome, {user.name || "Instructor"} 👋
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="space-y-6">
          {/* Add New Course */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
            <p className="text-gray-600 mb-2">
              Create a new course by uploading videos, setting the description, and adding quizzes.
            </p>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              {showAddForm ? "Close Form" : "Add Course"}
            </button>

            {showAddForm && <AddCourseForm onCourseAdded={fetchCourses} />}
          </div>

          {/* Courses Analytics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
            {courses.length === 0 ? (
              <p className="text-gray-600">You haven't created any courses yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between"
                  >
                    <div>
                      {editingCourseId === course._id ? (
                        <>
                          <input
                            name="title"
                            value={editFormData.title}
                            onChange={handleEditChange}
                            placeholder="Course Title"
                            className="border p-1 mb-2 w-full rounded"
                          />
                          <textarea
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditChange}
                            placeholder="Description"
                            className="border p-1 mb-2 w-full rounded"
                          />
                          <input
                            name="category"
                            value={editFormData.category}
                            onChange={handleEditChange}
                            placeholder="Category"
                            className="border p-1 mb-2 w-full rounded"
                          />
                          <input
                            name="thumbnail"
                            value={editFormData.thumbnail || ""}
                            onChange={handleEditChange}
                            placeholder="Thumbnail URL"
                            className="border p-1 mb-2 w-full rounded"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdate}
                              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCourseId(null)}
                              className="bg-gray-400 text-white px-3 py-1 rounded-md hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                          <p className="text-gray-600 text-sm">
                            Description: {course.description || "N/A"}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Category: {course.category || "N/A"}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Students Enrolled: {course.studentsEnrolled?.length ?? 0}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Completion Rate: {course.analytics?.completionRate ?? 0}%
                          </p>
                          <p className="text-gray-600 text-sm">
                            Total Views: {course.analytics?.totalViews ?? 0}
                          </p>
                        </>
                      )}
                    </div>

                    {editingCourseId !== course._id && (
                      <div className="mt-4 flex gap-2 flex-wrap">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                          onClick={() => navigate(`/instructor/course/${course._id}/progress`)}
                        >
                          View Progress
                        </button>
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                          onClick={() => startEditing(course)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                          onClick={() => handleDelete(course._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Interactions */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Student Interactions</h2>
            <p className="text-gray-600">
              Engage with students via Q&A boards, answer their questions, and view feedback.
            </p>
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Manage Q&A
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
