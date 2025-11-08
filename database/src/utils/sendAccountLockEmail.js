const nodemailer = require("nodemailer");
const geoip = require("geoip-lite");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email when a failed login attempt occurs (>=2 times)
 * or when the account gets locked (>=3 times).
 *
 * @param {string} to - Recipient email
 * @param {string} ip - IP address of the client
 * @param {string} userAgent - Browser/device info
 * @param {number} failedAttempts - Number of consecutive failed attempts
 * @param {number} lockMinutes - Lock duration (only used if locked)
 */
async function sendAccountLockEmail(to, ip, userAgent, failedAttempts, lockMinutes = 15) {
  const geo = ip ? geoip.lookup(ip) : null;
  const location = geo
    ? `${geo.city || "Unknown City"}, ${geo.region || "Unknown Region"}, ${geo.country || "Unknown Country"}`
    : "Unknown Location";

  const isLocked = failedAttempts >= 3;
  const subject = isLocked
    ? "🚫 Your Lern.it Account Has Been Locked"
    : "⚠️ Multiple Failed Login Attempts Detected";

  const warningMessage = `
    We noticed <strong>${failedAttempts}</strong> consecutive failed login attempts to your <strong>Lern.it</strong> account.
    Please double-check your password. Your account will be locked after 3 failed attempts.
  `;

  const lockMessage = `
    Your <strong>Lern.it</strong> account has been temporarily locked due to multiple failed login attempts.
    For your security, the account will remain locked for <strong>${lockMinutes} minutes</strong>.
  `;

  const html = `
  <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f8; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      
      <div style="background-color: ${isLocked ? "#dc2626" : "#f59e0b"}; padding: 16px 24px; color: white;">
        <h2 style="margin: 0; font-weight: 600;">Lern.it Security Alert</h2>
      </div>
      
      <div style="padding: 24px;">
        <h3 style="color: #333;">${isLocked ? "Account Locked" : "Failed Login Attempt Detected"}</h3>
        <p style="color: #555; line-height: 1.6;">
          Hello,<br><br>
          ${isLocked ? lockMessage : warningMessage}
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 0; color: #666;">📍 <strong>IP Address:</strong></td>
            <td style="padding: 8px 0; color: #333;">${ip || "Unknown"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">🌍 <strong>Location:</strong></td>
            <td style="padding: 8px 0; color: #333;">${location}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">💻 <strong>Device:</strong></td>
            <td style="padding: 8px 0; color: #333;">${userAgent}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">🕒 <strong>Time:</strong></td>
            <td style="padding: 8px 0; color: #333;">${new Date().toLocaleString()}</td>
          </tr>
        </table>

        <p style="margin-top: 24px; color: #555; line-height: 1.5;">
          ${
            isLocked
              ? "You can try logging in again after the lock period expires, or reset your password now."
              : "If these attempts weren’t made by you, please change your password immediately."
          }
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://Lern.it.com/reset-password"
            style="background-color: ${isLocked ? "#dc2626" : "#f59e0b"}; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 500;">
            ${isLocked ? "Reset Password" : "Secure My Account"}
          </a>
        </div>
      </div>

      <div style="background-color: #f4f6f8; padding: 16px; text-align: center; font-size: 13px; color: #888;">
        © ${new Date().getFullYear()} Lern.it. All rights reserved.<br>
        Security Notification System
      </div>
    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"Lern.it Security" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log(
    `📧 ${isLocked ? "Account lock" : "Failed attempt"} email sent to ${to} (${location})`
  );
}

module.exports = { sendAccountLockEmail };
