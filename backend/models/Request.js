// Request model — represents a food request made by a receiver/NGO for a donation
const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema(
  {
    // The user requesting the food (receiver or NGO)
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverName: { type: String, required: true },

    // The donation being requested
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    donationTitle: { type: String, required: true },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },

    // Optional message from the requester to the donor
    message: { type: String, default: '' },

    // When the donor responded (accepted or rejected)
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for common queries
RequestSchema.index({ receiverId: 1, createdAt: -1 });
RequestSchema.index({ donationId: 1 });

module.exports = mongoose.model('Request', RequestSchema);
