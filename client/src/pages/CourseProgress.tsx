import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface StudentProgress {
  studentId: string;
  name: string;
  email: string;
  percentage: number;
  completedVideos: number[];
}

interface CourseProgressData {
  courseTitle: string;
  totalVideos: number;
  students: StudentProgress[];
}

const CourseProgress: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [data, setData] = useState<CourseProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get(`/api/progress/${courseId}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [courseId, token]);

  if (loading) return <p>Loading progress...</p>;
  if (!data) return <p>Failed to load course progress.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button
        className="mb-4 text-green-700 hover:underline"
        onClick={() => navigate("/instructor/dashboard")}
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-4">{data.courseTitle} - Progress</h1>

      <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
        <thead className="bg-green-100">
          <tr>
            <th className="text-left px-4 py-2">Student Name</th>
            <th className="text-left px-4 py-2">Email</th>
            <th className="text-left px-4 py-2">Completed Videos</th>
            <th className="text-left px-4 py-2">Progress %</th>
          </tr>
        </thead>
        <tbody>
          {data.students.map((s) => (
            <tr key={s.studentId} className="border-b last:border-none">
              <td className="px-4 py-2">{s.name}</td>
              <td className="px-4 py-2">{s.email}</td>
              <td className="px-4 py-2">
                {s.completedVideos.length} / {data.totalVideos}
              </td>
              <td className="px-4 py-2">{s.percentage.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseProgress;
