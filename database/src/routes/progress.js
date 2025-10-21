const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const { requireAnyRole } = require("../middleware/roles");

// ------------------------------------
// Student Endpoints
// ------------------------------------

// Get student's progress for a course
router.get("/:courseId", auth, requireAnyRole(["Student"]), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate("progress.student", "name email")
      .populate("studentsEnrolled", "name email");

    if (!course) return res.status(404).json({ message: "Course not found" });

    const studentProgress = course.progress.find(p => p.student._id.equals(req.user._id));

    if (!studentProgress)
      return res.status(404).json({ message: "No progress found for this student" });

    res.json({
      course: course.title,
      progress: {
        percentage: studentProgress.percentage,
        completedVideos: studentProgress.completedVideos.length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark a video as completed
router.post("/:courseId/complete/:videoId", auth, requireAnyRole(["Student"]), async (req, res) => {
  try {
    const { courseId, videoId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!course.studentsEnrolled.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }

    let progress = course.progress.find(p => p.student.equals(req.user._id));
    if (!progress) {
      progress = {
        student: req.user._id,
        completedVideos: [],
        percentage: 0,
        lastUpdated: new Date(),
      };
      course.progress.push(progress);
    }

    // Avoid duplicates
    if (!progress.completedVideos.some(v => v.equals(videoId))) {
      progress.completedVideos.push(videoId);
    }

    // Update percentage
    const totalVideos = course.videos.length || 1;
    progress.percentage = Math.round((progress.completedVideos.length / totalVideos) * 100);
    progress.lastUpdated = new Date();

    // Update analytics
    course.analytics.totalViews += 1;
    const totalStudents = course.studentsEnrolled.length || 1;
    const completedStudents = course.progress.filter(p => p.percentage >= 100).length;
    course.analytics.completionRate = Math.round((completedStudents / totalStudents) * 100);

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

// ------------------------------------
// Instructor Endpoints
// ------------------------------------

// Get all students' progress in a course (Instructor only)
router.get("/:courseId/students", auth, requireAnyRole(["Instructor"]), async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      instructor: req.user._id,
    }).populate("progress.student", "name email");

    if (!course) return res.status(404).json({ message: "Course not found or unauthorized" });

    const studentProgressList = course.progress.map(p => ({
      student: p.student.name,
      email: p.student.email,
      percentage: p.percentage,
      completedVideos: p.completedVideos.length,
    }));

    res.json({
      course: course.title,
      progress: studentProgressList,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
