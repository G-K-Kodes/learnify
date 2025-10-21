const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const { requireAnyRole } = require("../middleware/roles");

// 🧑‍🏫 Create a new course (Instructor/Admin only)
router.post("/", auth, requireAnyRole(["Instructor", "Admin"]), async (req, res) => {
  try {
    const { title, description, category, videos, thumbnail } = req.body;
    const course = await Course.create({
      title,
      description,
      category,
      videos,
      thumbnail,
      instructor: req.user._id,
    });
    res.status(201).json({ message: "Course created", course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📚 Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name email");
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🔍 Get a single course by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("instructor", "name email");
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✏️ Update a course (only creator or Admin)
router.put("/:id", auth, requireAnyRole(["Instructor", "Admin"]), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Instructor can update only their own courses
    if (req.user.role !== "Admin" && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    Object.assign(course, req.body);
    await course.save();

    res.json({ message: "Course updated", course });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🗑 Delete a course (only creator or Admin)
router.delete("/:id", auth, requireAnyRole(["Instructor", "Admin"]), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (req.user.role !== "Admin" && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await course.deleteOne();
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🧑‍🎓 Enroll in a course (Student only)
router.post("/:id/enroll", auth, requireAnyRole(["Student"]), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Prevent duplicate enrollment
    if (course.studentsEnrolled.includes(req.user._id)) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    course.studentsEnrolled.push(req.user._id);
    await course.save();

    res.status(200).json({ message: "Enrolled successfully", courseId: course._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🚫 Unenroll from a course (Student only)
router.post("/:id/unenroll", auth, requireAnyRole(["Student"]), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const index = course.studentsEnrolled.indexOf(req.user._id);
    if (index === -1) {
      return res.status(400).json({ message: "Not enrolled in this course" });
    }

    course.studentsEnrolled.splice(index, 1);
    await course.save();

    res.status(200).json({ message: "Unenrolled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 📚 Get all courses a student is enrolled in
router.get("/my/enrollments", auth, requireAnyRole(["Student"]), async (req, res) => {
  try {
    const courses = await Course.find({ studentsEnrolled: req.user._id })
      .populate("instructor", "name email")
      .select("title description category thumbnail instructor");

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 👨‍🏫 Get all students enrolled in a course (Instructor/Admin)
router.get("/:id/students", auth, requireAnyRole(["Instructor", "Admin"]), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("studentsEnrolled", "name email role");
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Instructors can view only their own course’s students
    if (req.user.role === "Instructor" && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json(course.studentsEnrolled);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
