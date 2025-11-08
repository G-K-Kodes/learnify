const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const { requireAnyRole ,  requireCourseOwnership } = require("../middleware/roles");

// 📊 Get all courses created by this instructor (paginated + optional filters)
router.get("/my-courses", auth, requireAnyRole(["Instructor"]), async (req, res) => {
  try {
    // Extract pagination and filter options
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const category = req.query.category;
    const sortBy = req.query.sortBy || "createdAt"; // sort field
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1; // ascending/descending

    // Build query
    const query = { instructor: req.user._id };
    if (category) query.category = category;

    // Get total and paginated courses
    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .select("title description category thumbnail analytics createdAt")
      .lean();

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      courses,
    });
  } catch (err) {
    console.error("Error fetching instructor courses:", err);
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

// ---------------------------------------------
// Get detailed info for a single course
// /instructor/course/:id
// ---------------------------------------------
router.get("/course/:id", auth, requireAnyRole(["Instructor"]), async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id,
    })
      .populate("studentsEnrolled", "name email")
      .populate("instructor", "name email")
      .populate("discussions.student", "name email")
      .populate("discussions.answers.instructor", "name email")
      .populate("ratings.student", "name email")
      .lean();

    if (!course)
      return res
        .status(404)
        .json({ message: "Course not found or not owned by you" });

    // Map student progress safely
    const students = (course.studentsEnrolled || [])
      .map((student) => {
        if (!student) return null;
        const progressEntry = course.progress?.find(
          (p) => p.student?.toString() === student._id.toString()
        );
        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          progress: progressEntry?.percentage ?? 0,
          lastActive: progressEntry?.lastUpdated ?? null,
        };
      })
      .filter(Boolean);

    // Map discussions safely
    const discussions = (course.discussions || [])
      .map((d) => {
        if (!d.student) return null;
        return {
          _id: d._id,
          student: {
            _id: d.student._id,
            name: d.student.name,
            email: d.student.email,
          },
          question: d.question,
          answers: (d.answers || [])
            .filter((a) => a.instructor)
            .map((a) => ({
              instructor: {
                _id: a.instructor._id,
                name: a.instructor.name,
                email: a.instructor.email,
              },
              answer: a.answer,
              createdAt: a.createdAt,
            })),
          createdAt: d.createdAt,
        };
      })
      .filter(Boolean);

    // Map ratings safely
    const ratings = (course.ratings || [])
      .filter((r) => r.student)
      .map((r) => ({
        student: {
          _id: r.student._id,
          name: r.student.name,
          email: r.student.email,
        },
        rating: r.rating,
        review: r.review,
        createdAt: r.createdAt,
      }));

    // Analytics object
    const analytics = {
      totalViews: course.analytics?.totalViews ?? 0,
      completionRate: course.analytics?.completionRate ?? 0,
      totalEnrollments: students.length,
      averageRating: course.analytics?.averageRating ?? 0,
    };

    res.json({
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        thumbnail: course.thumbnail,
        price: course.price,
        videos: course.videos,
        studentsEnrolled: students,
        discussions,
        ratings,
        analytics,
        instructor: course.instructor
          ? {
              _id: course.instructor._id,
              name: course.instructor.name,
              email: course.instructor.email,
            }
          : null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📊 Get instructor dashboard stats
router.get("/stats", auth, requireAnyRole(["Instructor"]), async (req, res) => {
  try {
    const instructorId = req.user._id;

    // 1️⃣ Find all courses by this instructor
    const courses = await Course.find({ instructor: instructorId })
      .populate("studentsEnrolled")
      .lean();

    // 2️⃣ Aggregate stats
    const totalCourses = courses.length;
    const totalStudents = new Set(
      courses.flatMap((c) => c.studentsEnrolled.map((s) => s._id.toString()))
    ).size;
    const totalEarnings = courses.reduce((sum, c) => sum + c.price * c.studentsEnrolled.length, 0);

    const allRatings = courses.flatMap((c) => c.ratings.map((r) => r.rating));
    const averageRating =
      allRatings.length > 0
        ? parseFloat((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(2))
        : 0;

    // 3️⃣ Upsert (update or create) stats in cache
    const stats = await InstructorStats.findOneAndUpdate(
      { instructor: instructorId },
      {
        totalStudents,
        totalCourses,
        totalEarnings,
        averageRating,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching instructor stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
