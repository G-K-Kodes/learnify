// controllers/authController.js
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const ResetToken = require("../models/ResetToken");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const sendResetCodeEmail = require("../utils/emailService.js").sendResetCodeEmail;

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered." });

    const passwordHash = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 3600000;

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

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await ResetToken.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    // ✅ Send code via email
    await sendResetCodeEmail(email, code);

    res.json({ message: "Password reset code sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send reset code" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const tokenDoc = await ResetToken.findOne({ email });
    if (!tokenDoc) return res.status(400).json({ message: "No reset request found" });

    if (tokenDoc.code !== code)
      return res.status(400).json({ message: "Invalid code" });

    if (tokenDoc.expiresAt < new Date())
      return res.status(400).json({ message: "Code expired" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });

    await ResetToken.deleteOne({ email });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
