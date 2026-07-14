const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

// GET my notifications, newest first
router.get("/", auth, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
});

// Mark one notification as read
router.put("/:id/read", auth, async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    next(err);
  }
});

// Mark all as read
router.put("/read-all", auth, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json({ msg: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
