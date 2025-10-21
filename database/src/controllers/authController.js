// controllers/authController.js
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const sendVerificationEmail = require("../utils/sendVerificationEmail");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered." });

    const passwordHash = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 3600000; // 1 hour

    const newUser = new User({
      name,
      email,
      passwordHash,
      role,
      verificationToken,
      verificationTokenExpires,
    });

    await newUser.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: "User registered. Please check your email to verify your account.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration." });
  }
};
