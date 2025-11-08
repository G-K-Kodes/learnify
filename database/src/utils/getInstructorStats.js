const Course = require("../models/Course");

/**
 * 🔹 Get instructor statistics
 * Called whenever a course is created, updated, or student enrollment changes
 */
async function getInstructorStats(instructorId) {
  try {
    // Fetch all courses by this instructor
    const courses = await Course.find({ instructor: instructorId });

    const totalCourses = courses.length;
    const totalStudents = courses.reduce((sum, c) => sum + c.studentsEnrolled.length, 0);

    // Average rating across all their courses
    const allRatings = courses.flatMap(c => c.ratings.map(r => r.rating));
    const averageRating =
      allRatings.length > 0
        ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
        : 0;

    // Earnings — if you later add a field like `course.price`
    const totalEarnings = courses.reduce((sum, c) => sum + (c.price || 0) * c.studentsEnrolled.length, 0);

    return {
      totalCourses,
      totalStudents,
      averageRating: Number(averageRating.toFixed(2)),
      totalEarnings,
    };
  } catch (err) {
    console.error("Error fetching instructor stats:", err);
    return { totalCourses: 0, totalStudents: 0, averageRating: 0, totalEarnings: 0 };
  }
}

module.exports = getInstructorStats;
