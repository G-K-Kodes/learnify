const Course = require("../models/Course");

/**
 * Allow only specific roles
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: `Access denied: ${role} role required` });
    }
    next();
  };
}

/**
 * Allow any of multiple roles
 */
function requireAnyRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient role" });
    }
    next();
  };
}

/**
 * For Admin-specific permission flags (e.g., manageUsers, manageCourses)
 */
function requireAdminPermission(permissionKey) {
  return (req, res, next) => {
    if (
      !req.user ||
      req.user.role !== "Admin" ||
      !req.user.permissions ||
      !req.user.permissions[permissionKey]
    ) {
      return res.status(403).json({ message: `Access denied: missing ${permissionKey} permission` });
    }
    next();
  };
}

/**
 * Ensure instructor owns the resource (course)
 */
async function requireCourseOwnership(req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) return res.status(404).json({ message: "Course not found" });

    // Admins always pass
    if (req.user.role === "Admin") return next();

    // Only the instructor who owns the course can proceed
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied: not your course" });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  requireRole,
  requireAnyRole,
  requireAdminPermission,
  requireCourseOwnership,
};
