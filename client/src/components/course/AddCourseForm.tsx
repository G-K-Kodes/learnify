import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";

interface AddCourseFormProps {
  onCourseAdded?: () => void;
}

const AddCourseForm: React.FC<AddCourseFormProps> = ({ onCourseAdded }) => {
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [videos, setVideos] = useState<{ title: string; url: string; duration: number }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post(
        "/courses",
        { title, description, category, thumbnail, videos },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(res.data);
      alert("Course created successfully!");
      onCourseAdded?.();

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setThumbnail("");
      setVideos([]);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create course");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <input
        type="text"
        placeholder="Course Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full border px-3 py-2 rounded-md"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border px-3 py-2 rounded-md"
      />
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full border px-3 py-2 rounded-md"
      />
      <input
        type="text"
        placeholder="Thumbnail URL"
        value={thumbnail}
        onChange={(e) => setThumbnail(e.target.value)}
        className="w-full border px-3 py-2 rounded-md"
      />
      {/* You can add video management inputs here */}
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Create Course
      </button>
    </form>
  );
};

export default AddCourseForm;
