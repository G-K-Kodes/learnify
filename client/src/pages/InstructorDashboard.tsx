import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import AddCourseForm from "../components/course/AddCourseForm";
import InstructorStats from "../components/dashboard/InstructorStats";

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

  // Editing state
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    category: "",
    thumbnail: "",
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [fileName, setFileName] = useState("No file selected...");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCourses = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/instructor/my-courses?page=${pageNum}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses(res.data.courses || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(page);
  }, [page]);

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
      fetchCourses(page);
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
    setThumbnailPreview(course.thumbnail ?? "");
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEditFormData((prev) => ({ ...prev, thumbnail: base64String }));
      setThumbnailPreview(base64String);
    };
    reader.readAsDataURL(file);
    setFileName(file.name);
  };

  const handleUpdate = async () => {
    if (!editingCourseId) return;
    try {
      await axiosInstance.put(`/courses/${editingCourseId}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Course updated successfully!");
      setEditingCourseId(null);
      fetchCourses(page);
    } catch (err) {
      console.error(err);
      alert("Failed to update course.");
    }
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-emerald-400">
          Welcome, {user.name || "Instructor"} 👋
        </h1>
        <button
          onClick={handleLogout}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300"
        >
          Logout
        </button>
      </div>

      <InstructorStats className="mb-10" />

      {loading ? (
        <p className="text-gray-400">Loading courses...</p>
      ) : (
        <div className="space-y-8">
          {/* Add New Course */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 hover:border-emerald-400/40 transition">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-emerald-400">
                Add New Course
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all duration-300"
              >
                {showAddForm ? "Close Form" : "Add Course"}
              </button>
            </div>
            {showAddForm && (
              <AddCourseForm onCourseAdded={() => fetchCourses(page)} />
            )}
          </div>

          {/* Courses List */}
          <div>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">
              Your Courses
            </h2>
            {courses.length === 0 ? (
              <p className="text-gray-400 italic">
                You haven’t created any courses yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="bg-slate-800/70 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-slate-700 hover:shadow-2xl hover:border-emerald-400/40 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {editingCourseId === course._id ? (
                        <>
                          <input
                            name="title"
                            value={editFormData.title}
                            onChange={handleEditChange}
                            placeholder="Course Title"
                            className="border border-slate-700 bg-slate-900 text-gray-100 placeholder-gray-400 p-2 mb-2 w-full rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                          />
                          <textarea
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditChange}
                            placeholder="Description"
                            className="border border-slate-700 bg-slate-900 text-gray-100 placeholder-gray-400 p-2 mb-2 w-full rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                          />
                          <input
                            name="category"
                            value={editFormData.category}
                            onChange={handleEditChange}
                            placeholder="Category"
                            className="border border-slate-700 bg-slate-900 text-gray-100 placeholder-gray-400 p-2 mb-2 w-full rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                          />

                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Thumbnail
                            </label>
                            <label
                              htmlFor={`thumbnail-edit-${course._id}`}
                              className="flex items-center space-x-3 cursor-pointer"
                            >
                              <div className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-sm">
                                Choose File
                              </div>
                              <span className="text-gray-500 text-sm italic">
                                {fileName || "No file selected..."}
                              </span>
                              <input
                                id={`thumbnail-edit-${course._id}`}
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailUpload}
                                className="sr-only"
                              />
                            </label>

                            {thumbnailPreview && (
                              <img
                                src={thumbnailPreview}
                                alt="Thumbnail Preview"
                                className="mt-3 w-40 h-28 object-cover rounded-md border border-slate-700 shadow-lg"
                              />
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdate}
                              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCourseId(null)}
                              className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-500 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <img
                            src={course.thumbnail || "/placeholder.jpg"}
                            alt={course.title}
                            className="w-full h-40 object-cover rounded-xl mb-3"
                          />
                          <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                            {course.title}
                          </h3>
                          <p className="text-gray-300 text-sm mb-1 leading-relaxed">
                            {course.description || "No description provided."}
                          </p>
                          <p className="text-gray-400 text-sm mb-1">
                            Category:{" "}
                            <span className="text-gray-200">
                              {course.category || "N/A"}
                            </span>
                          </p>
                          <p className="text-gray-400 text-sm mb-1">
                            Students Enrolled:{" "}
                            <span className="text-gray-200">
                              {course.studentsEnrolled?.length ?? 0}
                            </span>
                          </p>
                          <p className="text-gray-400 text-sm mb-1">
                            Completion Rate:{" "}
                            <span className="text-amber-400">
                              {course.analytics?.completionRate ?? 0}%
                            </span>
                          </p>
                          <p className="text-gray-400 text-sm">
                            Total Views:{" "}
                            <span className="text-gray-200">
                              {course.analytics?.totalViews ?? 0}
                            </span>
                          </p>
                        </>
                      )}
                    </div>

                    {editingCourseId !== course._id && (
                      <div className="mt-4 flex gap-2 flex-wrap">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-all"
                          onClick={() =>
                            navigate(`/instructor/course/${course._id}`)
                          }
                        >
                          View Progress
                        </button>
                        <button
                          className="bg-amber-400 text-slate-900 px-3 py-1 rounded-md hover:bg-amber-300 transition-all"
                          onClick={() => startEditing(course)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-all"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="px-3 py-1 bg-slate-700 text-gray-100 rounded-md hover:bg-slate-600 disabled:opacity-40 transition"
              >
                Prev
              </button>
              <span className="text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={page === totalPages}
                className="px-3 py-1 bg-slate-700 text-gray-100 rounded-md hover:bg-slate-600 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
