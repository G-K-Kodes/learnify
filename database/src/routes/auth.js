const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const ResetToken = require("../models/ResetToken");
const sendResetCodeEmail = require("../utils/sendResetCodeEmail");
const sendLoginAlertEmail = require("../utils/sendLoginAlertEmail").sendLoginAlertEmail;
const sendAccountLockEmail = require("../utils/sendAccountLockEmail").sendAccountLockEmail;
const LoginLog = require("../models/LoginLog");

const resetAttempts = new Map(); // Map<ip, Array<number (timestamps)>>
const MAX_REQUESTS_PER_WINDOW = 5; // max requests
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // sliding window in ms (1 hour)

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

    // Create user first
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
    });

    // Then generate a verification token (since user._id now exists)
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.EMAIL_SECRET,
      { expiresIn: "1h" }
    );

    const verificationTokenExpires = Date.now() + 3600000; // 1 hour

    // Update user with verification info
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      userId: user._id,
    });
  } catch (err) {
    console.error("❌ Error during registration:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify email
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Invalid verification link" });

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }, // Not expired
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired verification link" });

    if (user.isVerified) {
      return res.status(200).json({ message: "Email already verified!" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully", userId: user._id });
  } catch (err) {
    console.error(err);
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

    // Check if email is verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    // 🔒 Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({ message: `Account locked. Try again in ${remaining} minute(s).` });
    }

    // Auto-unlock if lock time has passed
    if (user.lockUntil && user.lockUntil <= Date.now()) {
      user.lockUntil = null;
      user.failedLoginAttempts = 0;
      await user.save();
    }


    // Validate password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      if (user.failedLoginAttempts >= 2) {
        sendAccountLockEmail(user.email, ip, userAgent, user.failedLoginAttempts)
          .catch(err => console.error("❌ Failed to send account warning email:", err));
      }

      // If 3 or more failed attempts → lock for 15 minutes
      if (user.failedLoginAttempts >= 3) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        // send final lock email
        sendAccountLockEmail(user.email, ip, userAgent, user.failedLoginAttempts, 15)
          .catch(err => console.error("❌ Failed to send account lock email:", err));

        return res.status(403).json({ message: "Account locked for 15 minutes due to multiple failed attempts." });
      }

      await user.save();
      return res.status(401).json({
        message: `Invalid credentials. ${3 - user.failedLoginAttempts} attempt(s) remaining.`,
      });
    }

    // ✅ Successful login → reset counters
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // ✅ Login successful
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Send email asynchronously (non-blocking)
    sendLoginAlertEmail(user.email, ip, userAgent)
      .catch(err => console.error("❌ Email failed:", err.message));

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await LoginLog.create({ userId: user._id, ip, userAgent });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified, // important
      },
    });
  } catch (err) {
    console.error("❌ Error during login:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/lock-status", async (req, res) => {
  const { email } = req.query;

  if (!email)
    return res.status(400).json({ message: "Email is required." });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found." });

    if (user.lockedUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000);
      return res.json({ isLocked: true, remainingTime });
    }

    // Unlock automatically if lock expired
    if (user.lockUntil && user.lockUntil <= Date.now()) {
      user.lockUntil = null;
      user.failedAttempts = 0;
      await user.save();
    }

    return res.json({ isLocked: false, remainingTime: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});


// POST /auth/resend-verification
// 📨 Resend verification email
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified." });
    }

    // 🔒 Prevent spamming: allow resend only every 60 seconds
    const now = Date.now();
    if (user.lastVerificationSent && now - user.lastVerificationSent < 60000) {
      const secondsLeft = Math.ceil(
        (60000 - (now - user.lastVerificationSent)) / 1000
      );
      return res.status(429).json({
        message: `Please wait ${secondsLeft}s before requesting another email.`,
      });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.EMAIL_SECRET,
      { expiresIn: "1h" }
    );

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = now + 3600000; // 1 hour
    user.lastVerificationSent = now;
    await user.save();

    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({ message: "Verification email resent successfully." });
  } catch (err) {
    console.error("❌ Error resending verification email:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/request-password-reset", async (req, res) => {
  try {
    const { email } = req.body;
    const ip = req.ip;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 🔒 Rate limit check
    const now = Date.now();
    const attempts = resetAttempts.get(ip) || [];
    const recent = attempts.filter((t) => now - t < RATE_LIMIT_WINDOW);

    if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
      return res
        .status(429)
        .json({ message: "Too many requests. Please try again later." });
    }

    resetAttempts.set(ip, [...recent, now]);

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete previous tokens for this user
    await ResetToken.deleteMany({ userId: user._id });

    // Save new reset code
    await ResetToken.create({ userId: user._id, code, ipAddress: ip });

    // Send email
    await sendResetCodeEmail(user.email, code);

    res.status(200).json({
      message: "Password reset code sent to your email.",
    });
  } catch (err) {
    console.error("❌ Error during password reset request:", err);
    res.status(500).json({ message: "Server error." });
  }
});

/**
 * ✅ Verify reset code and update password
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const resetRecord = await ResetToken.findOne({
      userId: user._id,
      code,
    });

    if (!resetRecord) {
      return res.status(400).json({ message: "Invalid or expired reset code." });
    }

    // ✅ Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    // Delete the used reset token
    await ResetToken.deleteMany({ userId: user._id });

    res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    console.error("❌ Error resetting password:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
