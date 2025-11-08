const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  // 👇 Role-based access
  role: { type: String, enum: ["Admin", "Instructor", "Student"], default: "Student" },

  // ✅ Verification
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,

  // 👇 Instructor fields
  bio: { type: String },
  expertise: [{ type: String }], // e.g., ["Web Development", "AI", "Design"]
  coursesCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

  // 👇 Student fields
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

  // 👇 Admin fields
  isSuperAdmin: { type: Boolean, default: false }, // only for org-created accounts
  permissions: {
    manageUsers: { type: Boolean, default: false },
    manageCourses: { type: Boolean, default: false },
    viewAnalytics: { type: Boolean, default: false },
  },

  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
