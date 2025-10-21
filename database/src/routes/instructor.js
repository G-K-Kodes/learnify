const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const { requireAnyRole } = require("../middleware/roles");

// 📊 Get all courses by the instructor with student progress
// In /instructor/my-courses
router.get("/my-courses", auth, requireAnyRole(["Instructor"]), async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).lean(); // lean() returns plain JS objects
    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// 👁️ View progress of all students in a specific course
router.get("/:courseId/progress", auth, requireAnyRole(["Instructor"]), async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      instructor: req.user._id,
    })
      .populate("progress.student", "name email")
      .select("title progress");

    if (!course) return res.status(404).json({ message: "Course not found or unauthorized" });

    res.json({
      course: course.title,
      progress: course.progress.map((p) => ({
        student: p.student.name,
        email: p.student.email,
        percentage: p.percentage,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
