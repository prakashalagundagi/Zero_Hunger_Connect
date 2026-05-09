const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    volunteerName: { type: String, required: true },
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    donationTitle: { type: String, required: true },
    pickupLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    deliveryLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['assigned', 'picked_up', 'in_transit', 'delivered'],
      default: 'assigned',
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

DeliverySchema.index({ volunteerId: 1 });
DeliverySchema.index({ donationId: 1 });

module.exports = mongoose.model('Delivery', DeliverySchema);
