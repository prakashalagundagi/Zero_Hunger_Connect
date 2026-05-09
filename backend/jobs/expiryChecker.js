// Expiry Checker Job
// Runs every hour to mark donations as expired and notify donors
const Donation = require('../models/Donation');
const { createNotification } = require('../controllers/notificationController');

const INTERVAL_MS = 60 * 60 * 1000; // 1 hour

const runExpiryCheck = async () => {
  try {
    const now = new Date();

    // Find donations that should be expired:
    // - pickupTimeEnd has passed, OR expiryDate has passed
    // - Status is still 'available' or 'claimed' (not already completed/expired)
    const expiredDonations = await Donation.find({
      status: { $in: ['available', 'claimed'] },
      $or: [
        { pickupTimeEnd: { $lt: now } },
        { expiryDate: { $lt: now } },
      ],
    });

    if (expiredDonations.length === 0) {
      console.log(`[ExpiryChecker] ${now.toISOString()} — No donations to expire.`);
      return;
    }

    console.log(`[ExpiryChecker] ${now.toISOString()} — Expiring ${expiredDonations.length} donation(s)...`);

    // Update all in one bulk write
    const ids = expiredDonations.map((d) => d._id);
    await Donation.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'expired' } }
    );

    // Notify each donor individually (fire-and-forget, non-blocking)
    for (const donation of expiredDonations) {
      const wasUnclaimed = donation.status === 'available';
      await createNotification({
        userId: donation.donorId,
        type: 'new_donation', // reuse info-level type for donor alerts
        title: wasUnclaimed
          ? 'Your donation listing has expired'
          : 'Claimed donation pickup window has passed',
        message: wasUnclaimed
          ? `"${donation.title}" was not claimed before the pickup window ended. You can post a new donation anytime.`
          : `"${donation.title}" was claimed but the pickup window has now passed. Please follow up with the receiver if needed.`,
        link: '/dashboard',
      });
    }

    console.log(`[ExpiryChecker] Done — ${expiredDonations.length} donation(s) marked as expired.`);
  } catch (err) {
    console.error('[ExpiryChecker] Error during expiry check:', err.message);
  }
};

const startExpiryChecker = () => {
  // Run once immediately on startup to catch anything that expired while the server was down
  runExpiryCheck();

  // Then repeat every hour
  const timer = setInterval(runExpiryCheck, INTERVAL_MS);

  // Allow Node.js to exit cleanly even if the interval is still pending
  if (timer.unref) timer.unref();

  console.log('[ExpiryChecker] Scheduled — runs every hour.');
};

module.exports = { startExpiryChecker, runExpiryCheck };
