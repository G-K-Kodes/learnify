const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🧾 Register (only Student or Instructor)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Prevent self-registration as Admin
    if (role === "Admin") {
      return res.status(403).json({ message: "Cannot self-register as Admin" });
    }

    // Check if email exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({ name, email, passwordHash, role });

    res.status(201).json({ message: "User registered successfully", userId: user._id });
  } catch (err) {
    console.error("❌ Error during registration:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔐 Login (any role)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Error during login:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
