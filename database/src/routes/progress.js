const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { requireAnyRole } = require("../middleware/roles");
const Course = require("../models/Course");

// Update progress
router.post("/:courseId/video/:videoIndex", auth, requireAnyRole(["Student"]), async (req, res) => {
  try {
    const { courseId, videoIndex } = req.params;
    const { watchedDuration, completed } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if student is enrolled
    if (!course.studentsEnrolled.includes(req.user._id)) {
      return res.status(403).json({ message: "Not enrolled in this course" });
    }

    // Find or create progress entry for student
    let studentProgress = course.progress.find(p => p.student.toString() === req.user._id.toString());
    if (!studentProgress) {
      studentProgress = { student: req.user._id, videosWatched: [] };
      course.progress.push(studentProgress);
    }

    // Update or add video progress
    const videoProgress = studentProgress.videosWatched.find(v => v.videoIndex === parseInt(videoIndex));
    if (videoProgress) {
      videoProgress.watchedDuration = watchedDuration;
      videoProgress.completed = completed;
    } else {
      studentProgress.videosWatched.push({ videoIndex: parseInt(videoIndex), watchedDuration, completed });
    }

    await course.save();
    res.json({ message: "Progress updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get student progress for a course
router.get("/:courseId", auth, requireAnyRole(["Student"]), async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const studentProgress = course.progress.find(p => p.student.toString() === req.user._id.toString()) || {
      student: req.user._id,
      videosWatched: [],
    };

    res.json(studentProgress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
