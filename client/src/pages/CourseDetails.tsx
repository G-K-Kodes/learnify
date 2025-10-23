import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

interface Student {
    _id: string;
    name: string;
    email: string;
    progress?: number;
    lastActive?: string;
}

interface Video {
    _id: string;
    title: string;
    duration: string;
    views: number;
    completionRate: number;
}

interface CourseAnalytics {
    totalViews?: number;
    completionRate?: number;
}

interface Answer {
    instructor: {
        _id: string;
        name: string;
        email: string;
    };
    answer: string;
    createdAt: string;
}

interface Discussion {
    _id: string;
    student: {
        _id: string;
        name: string;
        email: string;
    };
    question: string;
    answers: Answer[];
    createdAt: string;
}

interface Rating {
    student: {
        _id: string;
        name: string;
        email: string;
    };
    rating: number;
    review: string;
    createdAt: string;
}

interface Course {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    thumbnail?: string;
    analytics?: CourseAnalytics;
    studentsEnrolled?: Student[];
    videos?: Video[];
    discussions?: Discussion[];
    ratings?: Rating[];
}


const CourseDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCourseDetails = async () => {
        try {
            const res = await axiosInstance.get(`/instructor/course/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCourse(res.data.course);
            
        } catch (err) {
            console.error(err);
            alert("Failed to load course details.");
            navigate("/instructor");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseDetails();
    }, [id]);

    if (loading) {
        return <div className="p-8 text-gray-700">Loading course details...</div>;
    }

    if (!course) {
        return <div className="p-8 text-red-600">Course not found.</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-green-700">{course.title}</h1>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                    ← Back
                </button>
            </div>

            {/* Course Overview */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-6">
                <img
                    src={course.thumbnail || "https://via.placeholder.com/200x120"}
                    alt="thumbnail"
                    className="w-full md:w-1/3 rounded-lg object-cover"
                />
                <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-2">{course.title}</h2>
                    <p className="text-gray-600 mb-2">
                        <strong>Category:</strong> {course.category || "N/A"}
                    </p>
                    <p className="text-gray-600 mb-4">{course.description || "No description available."}</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700">
                        <p><strong>Students Enrolled:</strong> {course.studentsEnrolled?.length ?? 0}</p>
                        <p><strong>Completion Rate:</strong> {course.analytics?.completionRate ?? 0}%</p>
                        <p><strong>Total Views:</strong> {course.analytics?.totalViews ?? 0}</p>
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">📊 Analytics</h2>
                <p className="text-gray-600 mb-2">Visualize engagement and performance here.</p>
                {/* Placeholder for charts (use recharts or chart.js later) */}
                <div className="bg-green-100 border border-green-300 rounded-md p-6 text-center text-gray-500">
                    [Charts will appear here – e.g., Views over Time, Completion Rates, Quiz Stats]
                </div>
            </div>

            {/* Students Section */}
            <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
                <h2 className="text-xl font-semibold mb-4">👩‍🎓 Enrolled Students</h2>
                {course.studentsEnrolled && course.studentsEnrolled.length > 0 ? (
                    <table className="min-w-full text-sm border">
                        <thead>
                            <tr className="bg-green-200 text-left">
                                <th className="py-2 px-3">Name</th>
                                <th className="py-2 px-3">Email</th>
                                <th className="py-2 px-3">Progress</th>
                                <th className="py-2 px-3">Last Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {course.studentsEnrolled.map((student) => (
                                <tr key={student._id} className="border-t hover:bg-green-50">
                                    <td className="py-2 px-3">{student.name}</td>
                                    <td className="py-2 px-3">{student.email}</td>
                                    <td className="py-2 px-3">{student.progress ?? 0}%</td>
                                    <td className="py-2 px-3">{student.lastActive || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-600">No students enrolled yet.</p>
                )}
            </div>

            {/* Course Content Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">🎥 Course Content</h2>
                {course.videos && course.videos.length > 0 ? (
                    <table className="min-w-full text-sm border">
                        <thead>
                            <tr className="bg-green-200 text-left">
                                <th className="py-2 px-3">Lesson</th>
                                <th className="py-2 px-3">Duration</th>
                                <th className="py-2 px-3">Views</th>
                                <th className="py-2 px-3">Completion Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {course.videos.map((video) => (
                                <tr key={video._id} className="border-t hover:bg-green-50">
                                    <td className="py-2 px-3">{video.title}</td>
                                    <td className="py-2 px-3">{video.duration}</td>
                                    <td className="py-2 px-3">{video.views}</td>
                                    <td className="py-2 px-3">{video.completionRate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-600">No lessons added yet.</p>
                )}
                <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    + Add New Video
                </button>
            </div>

            {/* Q&A / Feedback Section */}
            <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
                <h2 className="text-xl font-semibold mb-4">💬 Student Interactions</h2>
                {course.discussions && course.discussions.length > 0 ? (
                    <table className="min-w-full text-sm border">
                        <thead>
                            <tr className="bg-green-200 text-left">
                                <th className="py-2 px-3">Student</th>
                                <th className="py-2 px-3">Question</th>
                                <th className="py-2 px-3">Instructor Answers</th>
                                <th className="py-2 px-3">Asked On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {course.discussions.map((d) => (
                                <tr key={d._id} className="border-t hover:bg-green-50 align-top">
                                    <td className="py-2 px-3">{d.student.name}</td>
                                    <td className="py-2 px-3">{d.question}</td>
                                    <td className="py-2 px-3">
                                        {d.answers.length > 0
                                            ? d.answers.map((a, idx) => (
                                                <div key={idx} className="mb-2 border-b border-gray-200 pb-1">
                                                    <strong>{a.instructor.name}:</strong> {a.answer}
                                                </div>
                                            ))
                                            : "No answers yet"}
                                    </td>
                                    <td className="py-2 px-3">{new Date(d.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-600">No questions from students yet.</p>
                )}
            </div>
            {/* Ratings Section */}
            <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
                <h2 className="text-xl font-semibold mb-4">⭐ Student Ratings & Reviews</h2>
                {course.ratings && course.ratings.length > 0 ? (
                    <table className="min-w-full text-sm border">
                        <thead>
                            <tr className="bg-green-200 text-left">
                                <th className="py-2 px-3">Student</th>
                                <th className="py-2 px-3">Rating</th>
                                <th className="py-2 px-3">Review</th>
                                <th className="py-2 px-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {course.ratings.map((r) => (
                                <tr key={r.student._id} className="border-t hover:bg-green-50">
                                    <td className="py-2 px-3">{r.student.name}</td>
                                    <td className="py-2 px-3">{r.rating} / 5</td>
                                    <td className="py-2 px-3">{r.review || "—"}</td>
                                    <td className="py-2 px-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-600">No ratings yet.</p>
                )}
            </div>

        </div>
    );
};

export default CourseDetails;
