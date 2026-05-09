const Delivery = require('../models/Delivery');
const Donation = require('../models/Donation');

// GET /api/deliveries — fetch all deliveries for the logged-in volunteer
const getMyDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ volunteerId: req.user._id }).sort({ createdAt: -1 });

    const formatted = deliveries.map((d) => ({
      id: d._id.toString(),
      volunteerId: d.volunteerId.toString(),
      volunteerName: d.volunteerName,
      donationId: d.donationId.toString(),
      donationTitle: d.donationTitle,
      pickupLocation: d.pickupLocation,
      deliveryLocation: d.deliveryLocation,
      status: d.status,
      completedAt: d.completedAt ? d.completedAt.toISOString() : null,
      createdAt: d.createdAt.toISOString(),
    }));

    res.json({ success: true, deliveries: formatted });
  } catch (error) {
    console.error('GetMyDeliveries error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching deliveries' });
  }
};

// POST /api/deliveries — volunteer claims a donation for delivery
const createDelivery = async (req, res) => {
  try {
    const { donationId, deliveryAddress, deliveryLat, deliveryLng } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }
    if (donation.status !== 'available' && donation.status !== 'claimed') {
      return res.status(400).json({ success: false, message: 'Donation is not available for delivery' });
    }

    const delivery = await Delivery.create({
      volunteerId: req.user._id,
      volunteerName: req.user.name,
      donationId: donation._id,
      donationTitle: donation.title,
      pickupLocation: donation.location,
      deliveryLocation: {
        lat: deliveryLat || 12.9352,
        lng: deliveryLng || 77.6245,
        address: deliveryAddress || 'Koramangala, Bengaluru, Karnataka',
      },
      status: 'assigned',
    });

    // Mark donation as picked up
    donation.volunteerId = req.user._id;
    donation.status = 'picked_up';
    await donation.save();

    res.status(201).json({
      success: true,
      delivery: {
        id: delivery._id.toString(),
        volunteerId: delivery.volunteerId.toString(),
        volunteerName: delivery.volunteerName,
        donationId: delivery.donationId.toString(),
        donationTitle: delivery.donationTitle,
        pickupLocation: delivery.pickupLocation,
        deliveryLocation: delivery.deliveryLocation,
        status: delivery.status,
        completedAt: null,
        createdAt: delivery.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('CreateDelivery error:', error);
    res.status(500).json({ success: false, message: 'Server error creating delivery' });
  }
};

// PATCH /api/deliveries/:id — update delivery status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['assigned', 'picked_up', 'in_transit', 'delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    if (delivery.volunteerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    delivery.status = status;
    if (status === 'delivered') {
      delivery.completedAt = new Date();
      // Mark the donation as delivered too
      await Donation.findByIdAndUpdate(delivery.donationId, { status: 'delivered' });
    }
    await delivery.save();

    res.json({
      success: true,
      delivery: {
        id: delivery._id.toString(),
        volunteerId: delivery.volunteerId.toString(),
        volunteerName: delivery.volunteerName,
        donationId: delivery.donationId.toString(),
        donationTitle: delivery.donationTitle,
        pickupLocation: delivery.pickupLocation,
        deliveryLocation: delivery.deliveryLocation,
        status: delivery.status,
        completedAt: delivery.completedAt ? delivery.completedAt.toISOString() : null,
        createdAt: delivery.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('UpdateDeliveryStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error updating delivery' });
  }
};

module.exports = { getMyDeliveries, createDelivery, updateDeliveryStatus };
