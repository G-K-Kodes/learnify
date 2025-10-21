const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  // 🎓 Basic Info
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  thumbnail: { type: String },

  // 🎬 Videos
  videos: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      title: String,
      url: String,
      duration: Number, // in seconds
    },
  ],

  // 👨‍🏫 Instructor
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // 💵 Price
  price: { type: Number, default: 0 },

  // 👩‍🎓 Enrolled Students
  studentsEnrolled: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ],

  // 💬 Q&A
  discussions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      question: String,
      answers: [
        {
          instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          answer: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      createdAt: { type: Date, default: Date.now },
    },
  ],

  // ⭐ Ratings
  ratings: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],

  // 📈 Student Progress
  progress: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      completedVideos: [{ type: mongoose.Schema.Types.ObjectId }],
      percentage: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
    },
  ],

  // 📊 Analytics
  analytics: {
    totalViews: { type: Number, default: 0 },
    totalEnrollments: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
  },

  createdAt: { type: Date, default: Date.now },
});

// Helper: update analytics automatically
courseSchema.methods.updateCompletionAnalytics = function () {
  const totalStudents = this.studentsEnrolled.length || 1;
  const completedStudents = this.progress.filter((p) => p.percentage >= 100).length;

  this.analytics.completionRate = Math.round((completedStudents / totalStudents) * 100);
  return this.save();
};

module.exports = mongoose.model("Course", courseSchema);
