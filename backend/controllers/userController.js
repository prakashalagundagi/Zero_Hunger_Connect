const User = require('../models/User');
const Donation = require('../models/Donation');

// GET /api/users — list all community members (public fields only, no passwords)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    // Attach donation count per donor
    const donorIds = users.filter(u => u.role === 'donor' || u.role === 'ngo').map(u => u._id);
    const donationCounts = await Donation.aggregate([
      { $match: { donorId: { $in: donorIds } } },
      { $group: { _id: '$donorId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    donationCounts.forEach(d => { countMap[d._id.toString()] = d.count; });

    const formatted = users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      role: u.role,
      avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`,
      location: u.location,
      phone: u.phone,
      donationsPosted: countMap[u._id.toString()] || 0,
      impactStats: u.impactStats,
      joinedAt: u.createdAt.toISOString(),
    }));

    res.json({ success: true, users: formatted, total: formatted.length });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

module.exports = { getAllUsers };
