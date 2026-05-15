// Donation controller — CRUD operations for food donations
const Donation = require('../models/Donation');
const User = require('../models/User');
const { createNotificationsForMany } = require('./notificationController');

// In-memory storage for demo donations (when database is not available)
let demoDonations = new Map();

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
    let donations = [];

    try {
      // Try database first
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

      donations = await Donation.find(filter).sort({ createdAt: -1 });
    } catch (dbError) {
      // Database not available - use demo donations
      console.log('Database not available, using demo donations for main list');
      
      donations = Array.from(demoDonations.values());
      
      // Apply filters manually for demo donations
      if (status && status !== 'all') {
        donations = donations.filter(d => d.status === status);
      }
      if (foodType && foodType !== 'all') {
        donations = donations.filter(d => d.foodType === foodType);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        donations = donations.filter(d => 
          d.title.toLowerCase().includes(searchLower) ||
          d.description.toLowerCase().includes(searchLower) ||
          d.donorName.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort by creation date
      donations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

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

// GET /api/donations/:id — get a single donation by ID
const getDonationById = async (req, res) => {
  try {
    let donation;
    
    try {
      // Try database first
      donation = await Donation.findById(req.params.id);
      
      if (!donation) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }
    } catch (dbError) {
      // Database not available - use demo donations
      console.log('Database not available, using demo donation for getById');
      
      donation = demoDonations.get(req.params.id);
      
      if (!donation) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }
    }

    res.json({ success: true, donation: formatDonation(donation) });
  } catch (error) {
    console.error('GetDonationById error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching donation' });
  }
};

// POST /api/donations — create a new donation
const createDonation = async (req, res) => {
  try {
    const {
      title,
      description,
      foodType,
      quantity,
      unit,
      pickupTimeStart,
      pickupTimeEnd,
      expiryDate,
      image,
      // Location fields submitted by the Donate form
      address,
      lat,
      lng,
    } = req.body;

    // Validate required fields
    if (!title || !description || !foodType || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Prefer the address submitted in the form; fall back to the user's profile location
    const donorLocation =
      address && lat && lng
        ? { lat: parseFloat(lat), lng: parseFloat(lng), address }
        : req.user.location || {
            lat: 12.9716,
            lng: 77.5946,
            address: 'Bengaluru, Karnataka',
          };

    let donation;
    
    try {
      donation = await Donation.create({
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
        image: image || undefined,
      });
    } catch (dbError) {
      // Database not available - create mock donation for demo
      console.log('Database not available, creating mock donation for demo');
      
      donation = {
        _id: Date.now().toString(),
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
        createdAt: new Date(),
        claimedBy: undefined,
        volunteerId: undefined,
        image: image || undefined,
      };
      
      // Store in demo donations Map
      demoDonations.set(donation._id, donation);
    }

    res.status(201).json({ success: true, donation: formatDonation(donation) });

    // After responding, notify all receivers, NGOs, and volunteers about the new donation
    setImmediate(async () => {
      try {
        // Try database first, fall back to demo mode
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
        } catch (notificationError) {
          // Database not available - skip notifications for demo
          console.log('Database not available, skipping notifications for demo');
        }
      } catch (err) {
        console.error('Notification broadcast error:', err.message);
      }
    });
  } catch (error) {
    console.error('CreateDonation error:', error);
    res.status(500).json({ success: false, message: 'Server error creating donation' });
  }
};

// PATCH /api/donations/:id/status — update donation status (donor only)
const updateDonationStatus = async (req, res) => {
  try {
    const { status, claimedBy, volunteerId } = req.body;

    const validStatuses = ['available', 'claimed', 'picked_up', 'delivered', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    let donation;
    
    try {
      // Try database first
      donation = await Donation.findById(req.params.id);
      
      if (!donation) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }

      // Only donor who created this donation can update its status
      if (donation.donorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this donation' });
      }

      donation.status = status;
      if (claimedBy) donation.claimedBy = claimedBy;
      if (volunteerId) donation.volunteerId = volunteerId;

      await donation.save();
    } catch (dbError) {
      // Database not available - use demo donations
      console.log('Database not available, updating demo donation status');
      
      donation = demoDonations.get(req.params.id);
      
      if (!donation) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }

      // Only donor who created this donation can update its status
      if (donation.donorId !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this donation' });
      }

      // Update demo donation
      donation.status = status;
      if (claimedBy) donation.claimedBy = claimedBy;
      if (volunteerId) donation.volunteerId = volunteerId;
      
      demoDonations.set(req.params.id, donation);
    }

    res.json({ success: true, donation: formatDonation(donation) });
  } catch (error) {
    console.error('UpdateDonationStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error updating donation' });
  }
};

// PATCH /api/donations/:id/volunteer — volunteer claims a donation for delivery
const volunteerClaim = async (req, res) => {
  try {
    // Only volunteers can use this endpoint
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ success: false, message: 'Only volunteers can claim deliveries' });
    }

    let donation;
    
    try {
      // Try database first
      donation = await Donation.findById(req.params.id);
      
      if (!donation) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }

      if (donation.status !== 'available') {
        return res.status(400).json({ success: false, message: 'This donation is no longer available' });
      }

      donation.status = 'claimed';
      donation.volunteerId = req.user._id;
      donation.claimedBy = req.user._id;

      await donation.save();
    } catch (dbError) {
      // Database not available - use demo donations
      console.log('Database not available, updating demo donation for volunteer claim');
      
      donation = demoDonations.get(req.params.id);
      
      if (!donation) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }

      if (donation.status !== 'available') {
        return res.status(400).json({ success: false, message: 'This donation is no longer available' });
      }

      donation.status = 'claimed';
      donation.volunteerId = req.user._id || req.user.id;
      donation.claimedBy = req.user._id || req.user.id;
      
      demoDonations.set(req.params.id, donation);
    }

    res.json({ success: true, donation: formatDonation(donation) });
  } catch (error) {
    console.error('VolunteerClaim error:', error);
    res.status(500).json({ success: false, message: 'Server error claiming donation' });
  }
};

// DELETE /api/donations/:id — delete a donation (donor only, must be available)
const deleteDonation = async (req, res) => {
  try {
    let donation;
    
    try {
      // Try database first
      donation = await Donation.findById(req.params.id);
      if (!donation) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }

      // Only creator can delete their donation
      if (donation.donorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this donation' });
      }

      await donation.deleteOne();

      res.json({ success: true, message: 'Donation deleted successfully' });
    } catch (dbError) {
      // Database not available - remove from demo donations
      console.log('Database not available, removing demo donation');
      
      donation = demoDonations.get(req.params.id);
      
      if (!donation) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }

      // Only creator can delete their donation
      if (donation.donorId !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this donation' });
      }

      demoDonations.delete(req.params.id);

      res.json({ success: true, message: 'Donation deleted successfully' });
    }
  } catch (error) {
    console.error('DeleteDonation error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting donation' });
  }
};

// GET /api/donations/my — get donations created by the logged-in user
const getMyDonations = async (req, res) => {
  try {
    let donations = [];
    
    try {
      // Try database first
      donations = await Donation.find({ donorId: req.user._id }).sort({ createdAt: -1 });
    } catch (dbError) {
      // Database not available - use demo donations
      console.log('Database not available, using demo donations for My Donations');
      
      // Filter demo donations by current user
      donations = Array.from(demoDonations.values())
        .filter(donation => donation.donorId === req.user._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
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
  volunteerClaim,
  deleteDonation,
  getMyDonations,
};
