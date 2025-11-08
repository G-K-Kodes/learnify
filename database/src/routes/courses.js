const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const { requireAnyRole } = require("../middleware/roles");
const { sendInstructorStats } = require("../socket");

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
    
    await sendInstructorStats(req.user._id);

    res.status(201).json({ message: "Course created", course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📚 Get all courses
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const totalCourses = await Course.countDocuments();
  const courses = await Course.find()
    .skip(skip)
    .limit(limit)
    .populate("instructor", "name email")
    .lean();

  res.json({
    total: totalCourses,
    page,
    totalPages: Math.ceil(totalCourses / limit),
    courses,
  });
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

    if (req.user.role !== "Admin" && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    Object.assign(course, req.body);
    await course.save();

    // ✅ Update stats for this instructor
    await sendInstructorStats(course.instructor);

    res.json({ message: "Course updated", course });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🗑 Delete a course
router.delete("/:id", auth, requireAnyRole(["Instructor", "Admin"]), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (req.user.role !== "Admin" && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await course.deleteOne();

    // ✅ Update stats for this instructor
    await sendInstructorStats(course.instructor);

    res.json({ message: "Course deleted" });
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

// 🧑‍🎓 Enroll in a course
router.post("/:id/enroll", auth, requireAnyRole(["Student"]), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.studentsEnrolled.some(id => id.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    course.studentsEnrolled.push(req.user._id);
    await course.save();

    // ✅ Update instructor stats
    await sendInstructorStats(course.instructor);

    res.status(200).json({ message: "Enrolled successfully", courseId: course._id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🚫 Unenroll from a course
router.post("/:id/unenroll", auth, requireAnyRole(["Student"]), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.studentsEnrolled = course.studentsEnrolled.filter(
      id => id.toString() !== req.user._id.toString()
    );
    await course.save();

    // ✅ Update instructor stats
    await sendInstructorStats(course.instructor);

    res.status(200).json({ message: "Unenrolled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 👨‍🏫 Get student progress for a course (Instructor/Admin)
router.get("/:id/progress", auth, requireAnyRole(["Instructor", "Admin"]), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("studentsEnrolled", "name email role")
      .lean();

    if (!course) return res.status(404).json({ message: "Course not found" });

    if (req.user.role === "Instructor" && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const totalVideos = course.videos?.length || 0;

    const students = course.studentsEnrolled.map(student => {
      const progressEntry = course.progress?.find(
        p => p.student.toString() === student._id.toString()
      );

      const completedVideos = progressEntry?.videosWatched
        ?.filter(v => v.completed)
        ?.map(v => v.videoIndex) || [];

      const percentage = totalVideos > 0
        ? Math.round((completedVideos.length / totalVideos) * 100)
        : 0;

      return {
        studentId: student._id,
        name: student.name,
        email: student.email,
        completedVideos,
        percentage,
      };
    });

    res.json({
      courseTitle: course.title,
      totalVideos,
      students,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;