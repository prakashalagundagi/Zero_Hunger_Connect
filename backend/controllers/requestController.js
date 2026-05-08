// Request controller — manages food requests from receivers/NGOs to donors
const Request = require('../models/Request');
const Donation = require('../models/Donation');

/**
 * Format a Mongoose request document into the shape the frontend expects.
 * Mirrors the TypeScript FoodRequest interface.
 */
const formatRequest = (request) => ({
  id: request._id.toString(),
  receiverId: request.receiverId.toString(),
  receiverName: request.receiverName,
  donationId: request.donationId.toString(),
  donationTitle: request.donationTitle,
  status: request.status,
  message: request.message,
  createdAt: request.createdAt.toISOString(),
  respondedAt: request.respondedAt ? request.respondedAt.toISOString() : undefined,
});

// POST /api/requests — create a request for a donation
const createRequest = async (req, res) => {
  try {
    const { donationId, message } = req.body;

    if (!donationId) {
      return res.status(400).json({ success: false, message: 'Donation ID is required' });
    }

    // Verify the donation exists and is still available
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }
    if (donation.status !== 'available') {
      return res.status(400).json({ success: false, message: 'This donation is no longer available' });
    }

    // Prevent donors from requesting their own donations
    if (donation.donorId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request your own donation' });
    }

    // Prevent duplicate pending requests
    const existingRequest = await Request.findOne({
      receiverId: req.user._id,
      donationId,
      status: 'pending',
    });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You already have a pending request for this donation' });
    }

    const request = await Request.create({
      receiverId: req.user._id,
      receiverName: req.user.name,
      donationId,
      donationTitle: donation.title,
      message: message || '',
    });

    res.status(201).json({ success: true, request: formatRequest(request) });
  } catch (error) {
    console.error('CreateRequest error:', error);
    res.status(500).json({ success: false, message: 'Server error creating request' });
  }
};

// GET /api/requests — get requests relevant to the logged-in user
// Donors see requests for their donations; receivers/NGOs see their sent requests
const getRequests = async (req, res) => {
  try {
    const user = req.user;
    let requests = [];

    if (user.role === 'donor' || user.role === 'ngo') {
      // Find all donations by this user, then get requests for those donations
      const myDonations = await Donation.find({ donorId: user._id }).select('_id');
      const donationIds = myDonations.map((d) => d._id);

      // For NGOs: also include their sent requests
      const [received, sent] = await Promise.all([
        Request.find({ donationId: { $in: donationIds } }).sort({ createdAt: -1 }),
        user.role === 'ngo'
          ? Request.find({ receiverId: user._id }).sort({ createdAt: -1 })
          : Promise.resolve([]),
      ]);

      // Merge and deduplicate
      const seen = new Set();
      requests = [...received, ...sent].filter((r) => {
        const key = r._id.toString();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } else {
      // Receivers and volunteers see only their own sent requests
      requests = await Request.find({ receiverId: user._id }).sort({ createdAt: -1 });
    }

    res.json({ success: true, requests: requests.map(formatRequest) });
  } catch (error) {
    console.error('GetRequests error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching requests' });
  }
};

// PATCH /api/requests/:id — accept or reject a request (donor only)
const respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be "accepted" or "rejected"' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Verify the logged-in user owns the donation being requested
    const donation = await Donation.findById(request.donationId);
    if (!donation || donation.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this request' });
    }

    // Update request status and timestamp
    request.status = status;
    request.respondedAt = new Date();
    await request.save();

    // If accepted, mark the donation as claimed and reject all other pending requests
    if (status === 'accepted') {
      await Donation.findByIdAndUpdate(request.donationId, {
        status: 'claimed',
        claimedBy: request.receiverId,
      });

      // Auto-reject other pending requests for the same donation
      await Request.updateMany(
        { donationId: request.donationId, _id: { $ne: request._id }, status: 'pending' },
        { status: 'rejected', respondedAt: new Date() }
      );
    }

    res.json({ success: true, request: formatRequest(request) });
  } catch (error) {
    console.error('RespondToRequest error:', error);
    res.status(500).json({ success: false, message: 'Server error responding to request' });
  }
};

// GET /api/requests/history — full request history for the current user
const getRequestHistory = async (req, res) => {
  try {
    const requests = await Request.find({ receiverId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, requests: requests.map(formatRequest) });
  } catch (error) {
    console.error('GetRequestHistory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createRequest, getRequests, respondToRequest, getRequestHistory };
