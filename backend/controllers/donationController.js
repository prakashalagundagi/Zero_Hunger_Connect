// Donation controller — CRUD operations for food donations
const Donation = require('../models/Donation');
const User = require('../models/User');
const { createNotificationsForMany } = require('./notificationController');

/**
 * Format a Mongoose donation document into the shape the frontend expects.
 * Mirrors the TypeScript FoodDonation interface.
 */
const formatDonation = (donation) => ({
  id: donation._id.toString(),
  donorId: donation.donorId.toString(),
  donorName: donation.donorName,
  donorAvatar: donation.donorAvatar,
  title: donation.title,
  description: donation.description,
  foodType: donation.foodType,
  quantity: donation.quantity,
  unit: donation.unit,
  location: donation.location,
  pickupTimeStart: donation.pickupTimeStart.toISOString(),
  pickupTimeEnd: donation.pickupTimeEnd.toISOString(),
  expiryDate: donation.expiryDate.toISOString(),
  status: donation.status,
  image: donation.image,
  createdAt: donation.createdAt.toISOString(),
  claimedBy: donation.claimedBy ? donation.claimedBy.toString() : undefined,
  volunteerId: donation.volunteerId ? donation.volunteerId.toString() : undefined,
});

// GET /api/donations — list all donations, optionally filtered by status or foodType
const getDonations = async (req, res) => {
  try {
    const { status, foodType, search } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (foodType && foodType !== 'all') filter.foodType = foodType;
    if (search) {
      // Case-insensitive search across title, description, and donorName
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { donorName: { $regex: search, $options: 'i' } },
      ];
    }

    const donations = await Donation.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: donations.length,
      donations: donations.map(formatDonation),
    });
  } catch (error) {
    console.error('GetDonations error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching donations' });
  }
};

// GET /api/donations/:id — single donation by ID
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }
    res.json({ success: true, donation: formatDonation(donation) });
  } catch (error) {
    console.error('GetDonationById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/donations — create a new donation (donors and NGOs only)
const createDonation = async (req, res) => {
  try {
    const {
      title, description, foodType, quantity, unit,
      pickupTimeStart, pickupTimeEnd, expiryDate, address,
      lat, lng,
    } = req.body;

    // Validate required fields
    if (!title || !description || !foodType || !quantity || !unit || !pickupTimeStart || !pickupTimeEnd || !expiryDate) {
      return res.status(400).json({ success: false, message: 'All donation fields are required' });
    }

    // Use user's stored location coordinates, falling back to provided values
    const donorLocation = {
      lat: lat || req.user.location.lat,
      lng: lng || req.user.location.lng,
      address: address || req.user.location.address,
    };

    const donation = await Donation.create({
      donorId: req.user._id,
      donorName: req.user.name,
      donorAvatar: req.user.avatar,
      title,
      description,
      foodType,
      quantity: parseFloat(quantity),
      unit,
      location: donorLocation,
      pickupTimeStart: new Date(pickupTimeStart),
      pickupTimeEnd: new Date(pickupTimeEnd),
      expiryDate: new Date(expiryDate),
      status: 'available',
    });

    res.status(201).json({ success: true, donation: formatDonation(donation) });

    // After responding, notify all receivers, NGOs, and volunteers about the new donation
    setImmediate(async () => {
      try {
        const recipients = await User.find({
          role: { $in: ['receiver', 'ngo', 'volunteer'] },
          _id: { $ne: req.user._id },
        }).select('_id');
        const userIds = recipients.map((u) => u._id);
        await createNotificationsForMany(userIds, {
          type: 'new_donation',
          title: 'New food donation available!',
          message: `${req.user.name} just posted "${donation.title}" — ${donation.quantity} ${donation.unit} available near ${donation.location.address.split(',')[0]}.`,
          link: '/browse',
        });
      } catch (err) {
        console.error('Notification broadcast error:', err.message);
      }
    });
  } catch (error) {
    console.error('CreateDonation error:', error);
    res.status(500).json({ success: false, message: 'Server error creating donation' });
  }
};

// PATCH /api/donations/:id/status — update donation status
const updateDonationStatus = async (req, res) => {
  try {
    const { status, claimedBy, volunteerId } = req.body;

    const validStatuses = ['available', 'claimed', 'picked_up', 'delivered', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Only the donor who created this donation can update its status
    if (donation.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this donation' });
    }

    donation.status = status;
    if (claimedBy) donation.claimedBy = claimedBy;
    if (volunteerId) donation.volunteerId = volunteerId;

    await donation.save();

    res.json({ success: true, donation: formatDonation(donation) });
  } catch (error) {
    console.error('UpdateDonationStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error updating donation' });
  }
};

// DELETE /api/donations/:id — delete a donation (donor only, must be available)
const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Only the creator can delete their donation
    if (donation.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this donation' });
    }

    await donation.deleteOne();

    res.json({ success: true, message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('DeleteDonation error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting donation' });
  }
};

// GET /api/donations/my — get donations created by the logged-in user
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, donations: donations.map(formatDonation) });
  } catch (error) {
    console.error('GetMyDonations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getDonations,
  getDonationById,
  createDonation,
  updateDonationStatus,
  deleteDonation,
  getMyDonations,
};
