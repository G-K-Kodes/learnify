const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const { requireAnyRole } = require("../middleware/roles");

// 🎥 Mark video as completed
router.post("/:courseId/complete/:videoId", auth, requireAnyRole(["Student"]), async (req, res) => {
  try {
    const { courseId, videoId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Ensure the user is enrolled
    if (!course.studentsEnrolled.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }

    // Find or create student progress entry
    let progress = course.progress.find((p) => p.student.equals(req.user._id));

    if (!progress) {
      progress = {
        student: req.user._id,
        completedVideos: [],
        percentage: 0,
        lastUpdated: new Date(),
      };
      course.progress.push(progress);
    }

    // Add video to completed list if not already present
    if (!progress.completedVideos.some((v) => v.equals(videoId))) {
      progress.completedVideos.push(videoId);
    }

    // Calculate percentage
    const totalVideos = course.videos.length || 1;
    progress.percentage = Math.round((progress.completedVideos.length / totalVideos) * 100);
    progress.lastUpdated = new Date();

    // Update analytics
    course.analytics.totalViews += 1; // increment view count
    await course.updateCompletionAnalytics(); // refresh completion rate

    await course.save();

    res.json({
      message: "Progress updated",
      progress: {
        percentage: progress.percentage,
        completedVideos: progress.completedVideos.length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
