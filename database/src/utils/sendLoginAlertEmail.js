const nodemailer = require("nodemailer");
const geoip = require("geoip-lite");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendLoginAlertEmail(to, ip, userAgent) {
  const subject = "🔐 New Login Detected on Your Lern.it Account";

  // Lookup IP location
  const geo = ip ? geoip.lookup(ip) : null;
  const location = geo
    ? `${geo.city || "Unknown City"}, ${geo.region || "Unknown Region"}, ${geo.country || "Unknown Country"}`
    : "Unknown Location";

  const html = `
  <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f8; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      
      <div style="background-color: #4f46e5; padding: 16px 24px; color: white;">
        <h2 style="margin: 0; font-weight: 600;">Lern.it</h2>
      </div>
      
      <div style="padding: 24px;">
        <h3 style="color: #333;">New Login Alert</h3>
        <p style="color: #555; line-height: 1.5;">
          Hello,<br><br>
          A new login to your <strong>Lern.it</strong> account was detected.
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
          If this was <strong>you</strong>, no action is needed.<br>
          If this was <strong>not you</strong>, we recommend changing your password immediately.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://Lern.it.com/reset-password" style="background-color: #4f46e5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 500;">Change Password</a>
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

  console.log(`📧 Login alert sent to ${to} (${location})`);
}

module.exports = { sendLoginAlertEmail };
