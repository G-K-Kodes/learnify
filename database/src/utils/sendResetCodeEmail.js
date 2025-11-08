// utils/sendResetCodeEmail.js
const nodemailer = require("nodemailer");

/**
 * Sends a password reset code to the user's email.
 * @param {string} email - Recipient email address
 * @param {string} code - 6-digit password reset code
 * @returns {Promise<void>}
 */
const sendResetCodeEmail = async (email, code) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Missing environment variables for email sending.");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail", // or use host: "smtp.gmail.com", port: 465, secure: true
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password recommended
      },
    });

    const mailOptions = {
      from: `"Lern.it Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Password Reset Code",
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Use the code below to proceed:</p>
          <div style="font-size: 24px; font-weight: bold; color: #4f46e5; margin: 16px 0;">
            ${code}
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 0.9rem; color: #555;">– The Lern.it Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (err) {
    console.error("❌ Error sending password reset email:", err);
    throw err; // rethrow so the controller can handle it
  }
};

module.exports = sendResetCodeEmail;
