const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'new_donation',      // Sent to receivers/NGOs/volunteers when a new donation is posted
        'request_received',  // Sent to donor when someone requests their food
        'request_accepted',  // Sent to receiver when their request is accepted
        'request_rejected',  // Sent to receiver when their request is rejected
        'delivery_assigned', // Sent to donor when a volunteer picks up their food
        'delivery_completed',// Sent to donor/receiver when delivery is done
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    // Optional link to the relevant resource
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
