import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";

interface AddCourseFormProps {
  onCourseAdded?: () => void;
}

const AddCourseForm: React.FC<AddCourseFormProps> = ({ onCourseAdded }) => {
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("No file selected...");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState<string>(""); // base64 data
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [videos, setVideos] = useState<{ title: string; url: string; duration: number }[]>([]);

  // Convert image file to Base64
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFileName(file.name);
      setThumbnail(base64String);
      setThumbnailPreview(base64String);
      localStorage.setItem("lastThumbnail", base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axiosInstance.post(
        "/courses",
        { title, description, category, thumbnail, videos },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Course created successfully!");
      onCourseAdded?.();

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setThumbnail("");
      setThumbnailPreview("");
      setVideos([]);
      localStorage.removeItem("lastThumbnail");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create course");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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

      {/* Thumbnail Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Thumbnail</label>

        {/* The core styling change happens here */}
        <label htmlFor="thumbnail-upload" className="flex items-center space-x-3 cursor-pointer">
          {/* 1. The custom-styled 'button' */}
          <div className="
            bg-emerald-500 hover:bg-emerald-600 text-white 
            font-semibold py-2 px-4 rounded-lg 
            shadow-md transition duration-300 ease-in-out
            text-sm
          ">
            Choose File
          </div>

          <span id="file-name" className="text-gray-500 text-sm italic">
            {fileName || 'No file selected...'}
          </span>

          <input
            id="thumbnail-upload"
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
            className="mt-3 w-40 h-28 object-cover rounded-md border shadow-lg"
          />
        )}
      </div>

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
