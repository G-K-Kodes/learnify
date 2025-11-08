const cron = require("node-cron");
const User = require("../models/User");

const CRON_SCHEDULE = String(process.env.CLEANUP_SCHEDULE).trim() || "* * * * *"; // every minute for debugging
const ENABLE_CLEANUP = String(process.env.ENABLE_CLEANUP).trim().toLowerCase() === "true";

async function runCleanupNow() {
  const now = new Date();
  console.log(`[CLEANUP] ${now.toLocaleString()} - Running immediate cleanup job...`);
  try {
    const result = await User.updateMany(
      { verificationTokenExpires: { $lt: now }, isVerified: false },
      { $unset: { verificationToken: "", verificationTokenExpires: "" } }
    );
    console.log(`[CLEANUP] Cleared expired tokens for ${result.modifiedCount} users.`);
  } catch (err) {
    console.error("[CLEANUP ERROR]", err);
  }
}

function startCleanupJob() {
  console.log("🧹 Cleanup job initialization started...");
  console.log(`ENABLE_CLEANUP = ${ENABLE_CLEANUP}`);
  if (!ENABLE_CLEANUP) {
    console.log("🕒 Cleanup job disabled via environment variable.");
    return;
  }

  console.log(`✅ Cleanup job enabled. Running on schedule: ${CRON_SCHEDULE}`);

  const performCleanup = async () => {
    const now = new Date();
    try {
      const result = await User.updateMany(
        { verificationTokenExpires: { $lt: now }, isVerified: false },
        { $unset: { verificationToken: "", verificationTokenExpires: "" } }
      );
      console.log(`[CLEANUP] ${new Date().toLocaleString()} - Cleared expired tokens for ${result.modifiedCount} users.`);
    } catch (err) {
      console.error("[CLEANUP ERROR]", err);
    }
  };

  // Run immediately at startup
  performCleanup();

  // Schedule recurring cleanup
  const task = cron.schedule(CRON_SCHEDULE, performCleanup, { scheduled: true });

  // Log next run time (if available)
  try {
    const nextRun = task.nextDates().toDate();
    console.log(`🗓️ Next cleanup scheduled at: ${nextRun.toLocaleString()}`);
  } catch {
    console.log("⚠️ Could not determine next scheduled cleanup time.");
  }
}

module.exports = startCleanupJob;
