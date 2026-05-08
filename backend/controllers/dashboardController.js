// Dashboard controller — user-specific stats and aggregated platform impact data
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const User = require('../models/User');

// GET /api/dashboard — fetch user-specific dashboard data based on their role
const getDashboardData = async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;

    // Fetch role-relevant data in parallel for performance
    const [myDonations, myRequests, availableDonations] = await Promise.all([
      // Donations created by this user (donors/NGOs)
      Donation.find({ donorId: userId }).sort({ createdAt: -1 }).limit(3),
      // Requests sent by this user (receivers/NGOs)
      Request.find({ receiverId: userId }).sort({ createdAt: -1 }).limit(3),
      // Available donations for browsing
      Donation.find({ status: 'available' }).sort({ createdAt: -1 }).limit(3),
    ]);

    // Calculate real impact stats from actual data
    const completedDonations = await Donation.find({
      donorId: userId,
      status: { $in: ['delivered', 'claimed', 'picked_up'] },
    });

    // Estimate impact: each kg of food = ~2 meals, 0.75 kg CO2 reduced
    const totalKgEquivalent = completedDonations.reduce((sum, d) => {
      const kgFactor = d.unit === 'kg' ? d.quantity : d.unit === 'lbs' ? d.quantity * 0.453 : d.quantity * 0.3;
      return sum + kgFactor;
    }, 0);

    const impactStats = {
      mealsSaved: Math.round(totalKgEquivalent * 2),
      foodWasteReduced: parseFloat(totalKgEquivalent.toFixed(1)),
      peopleHelped: Math.round(totalKgEquivalent * 0.8),
      co2Reduced: parseFloat((totalKgEquivalent * 0.75).toFixed(2)),
      donationsCompleted: completedDonations.length,
    };

    // Format donations for the frontend
    const formatDonation = (d) => ({
      id: d._id.toString(),
      donorId: d.donorId.toString(),
      donorName: d.donorName,
      donorAvatar: d.donorAvatar,
      title: d.title,
      foodType: d.foodType,
      quantity: d.quantity,
      unit: d.unit,
      status: d.status,
      location: d.location,
      pickupTimeStart: d.pickupTimeStart.toISOString(),
      pickupTimeEnd: d.pickupTimeEnd.toISOString(),
      expiryDate: d.expiryDate.toISOString(),
      description: d.description,
      createdAt: d.createdAt.toISOString(),
    });

    const formatRequest = (r) => ({
      id: r._id.toString(),
      receiverId: r.receiverId.toString(),
      receiverName: r.receiverName,
      donationId: r.donationId.toString(),
      donationTitle: r.donationTitle,
      status: r.status,
      message: r.message,
      createdAt: r.createdAt.toISOString(),
      respondedAt: r.respondedAt ? r.respondedAt.toISOString() : undefined,
    });

    res.json({
      success: true,
      data: {
        userStats: impactStats,
        myDonations: myDonations.map(formatDonation),
        myRequests: myRequests.map(formatRequest),
        availableDonations: availableDonations.map(formatDonation),
      },
    });
  } catch (error) {
    console.error('GetDashboardData error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard data' });
  }
};

// GET /api/dashboard/stats — donation statistics for the logged-in user
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalDonations, activeDonations, completedDonations, totalRequests] = await Promise.all([
      Donation.countDocuments({ donorId: userId }),
      Donation.countDocuments({ donorId: userId, status: 'available' }),
      Donation.countDocuments({ donorId: userId, status: { $in: ['delivered', 'claimed'] } }),
      Request.countDocuments({ receiverId: userId }),
    ]);

    res.json({
      success: true,
      stats: {
        totalDonations,
        activeDonations,
        completedDonations,
        totalRequests,
      },
    });
  } catch (error) {
    console.error('GetUserStats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/dashboard/platform — platform-wide impact metrics
const getPlatformStats = async (req, res) => {
  try {
    const [totalDonations, totalUsers, deliveredDonations] = await Promise.all([
      Donation.countDocuments(),
      User.countDocuments(),
      Donation.find({ status: { $in: ['delivered', 'claimed', 'picked_up'] } }),
    ]);

    // Aggregate platform-wide impact
    const totalKg = deliveredDonations.reduce((sum, d) => {
      const kgFactor = d.unit === 'kg' ? d.quantity : d.unit === 'lbs' ? d.quantity * 0.453 : d.quantity * 0.3;
      return sum + kgFactor;
    }, 0);

    res.json({
      success: true,
      platformStats: {
        mealsSaved: Math.round(totalKg * 2),
        foodWasteReduced: parseFloat(totalKg.toFixed(1)),
        peopleHelped: Math.round(totalKg * 0.8),
        co2Reduced: parseFloat((totalKg * 0.75).toFixed(2)),
        donationsCompleted: deliveredDonations.length,
        totalDonations,
        totalUsers,
      },
    });
  } catch (error) {
    console.error('GetPlatformStats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getDashboardData, getUserStats, getPlatformStats };
