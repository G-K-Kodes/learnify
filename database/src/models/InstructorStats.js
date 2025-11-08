// models/InstructorStats.js
const mongoose = require("mongoose");

const instructorStatsSchema = new mongoose.Schema({
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  totalStudents: { type: Number, default: 0 },
  totalCourses: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InstructorStats", instructorStatsSchema);
