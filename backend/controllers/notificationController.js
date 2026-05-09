const Notification = require('../models/Notification');

// Helper used by other controllers to create notifications without blocking the response
const createNotification = async ({ userId, type, title, message, link = '' }) => {
  try {
    await Notification.create({ userId, type, title, message, link });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

// Helper: bulk-create notifications for multiple users (e.g. broadcast to all receivers)
const createNotificationsForMany = async (userIds, { type, title, message, link = '' }) => {
  try {
    if (!userIds || userIds.length === 0) return;
    const docs = userIds.map((userId) => ({ userId, type, title, message, link }));
    await Notification.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error('Failed to bulk-create notifications:', err.message);
  }
};

// GET /api/notifications — fetch notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    const formatted = notifications.map((n) => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      link: n.link,
      createdAt: n.createdAt.toISOString(),
    }));

    res.json({ success: true, notifications: formatted, unreadCount });
  } catch (error) {
    console.error('GetNotifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/notifications/:id/read — mark a single notification as read
const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('MarkAsRead error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/notifications/read-all — mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (error) {
    console.error('MarkAllAsRead error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/notifications — clear all notifications for the user
const clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ success: true });
  } catch (error) {
    console.error('ClearAll error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createNotification,
  createNotificationsForMany,
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearAll,
};
