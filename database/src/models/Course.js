const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String }, // URL or path to thumbnail image
  videos: [
    {
      title: String,
      url: String, // path or S3 link
      duration: Number, // in seconds
    },
  ],
  category: { type: String },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  price: { type: Number, default: 0 },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  progress: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      videosWatched: [
        {
          videoIndex: Number,    // index of video in videos array
          watchedDuration: Number, // seconds watched
          completed: { type: Boolean, default: false },
        },
      ],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course", courseSchema);
