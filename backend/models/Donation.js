// Donation model — represents a food donation posted by a donor
const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema(
  {
    // Reference to the donor user
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Denormalized for quick display without joins
    donorName: { type: String, required: true },
    donorAvatar: { type: String, default: '' },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    foodType: {
      type: String,
      enum: ['prepared', 'raw', 'packaged', 'produce', 'bakery', 'dairy'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs', 'servings', 'items', 'portions', 'cans'],
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    pickupTimeStart: { type: Date, required: true },
    pickupTimeEnd: { type: Date, required: true },
    expiryDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ['available', 'claimed', 'picked_up', 'delivered', 'expired'],
      default: 'available',
    },

    // Set when a receiver/NGO claims the donation
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Set when a volunteer is assigned for delivery
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

// Index for common queries — status + location lookups
DonationSchema.index({ status: 1, createdAt: -1 });
DonationSchema.index({ donorId: 1 });

module.exports = mongoose.model('Donation', DonationSchema);
