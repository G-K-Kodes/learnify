// utils/sendVerificationEmail.js
const nodemailer = require("nodemailer");

/**
 * Sends a verification email to the user with a secure token.
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 * @returns {Promise<void>}
 */
const sendVerificationEmail = async (email, token) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.CLIENT_URL) {
      throw new Error("Missing environment variables for email sending.");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail", // or use host: "smtp.gmail.com", port: 465, secure: true
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password recommended
      },
    });

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Online Course Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Welcome to Online Course Platform!</h2>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}" target="_blank" style="color: #4f46e5; font-weight: bold;">Verify Email</a>
          <p style="font-size: 0.9rem; color: #555;">This link will expire in 1 hour.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (err) {
    console.error("❌ Error sending verification email:", err);
    throw err; // re-throw so calling function can handle
  }
};

module.exports = sendVerificationEmail;