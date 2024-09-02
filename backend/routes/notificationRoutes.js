const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// Get all notifications for the current user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user.id })
      .sort({ timestamp: -1 })
      .populate("sender", "username");
    res.json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: error.message });
  }
});

// Mark a notification as read
router.put("/:notificationId/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, receiver: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating notification", error: error.message });
  }
});

// Delete a notification
router.delete("/:notificationId", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      receiver: req.user.id,
    });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting notification", error: error.message });
  }
});

module.exports = router;
