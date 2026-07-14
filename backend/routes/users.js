const express = require("express");
const router = express.Router();

const User = require("../models/User");
const auth = require("../middleware/auth");

// GET all users (basic fields only) - requires login
router.get("/", auth, async (req, res, next) => {
  try {
    const users = await User.find({}, "name email role");
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// GET current logged-in user's own profile
router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, "name email role");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
