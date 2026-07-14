const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array() });
    return true;
  }
  return false;
}

// ======================
// REGISTER
// ======================
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["admin", "member", "Admin", "Member"])
      .withMessage("Role must be admin or member"),
  ],
  async (req, res, next) => {
    if (handleValidation(req, res)) return;

    try {
      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ msg: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const finalRole = role ? role.toLowerCase() : "member";

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: finalRole,
      });

      res.status(201).json({
        msg: "Registration Successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ======================
// LOGIN
// ======================
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    if (handleValidation(req, res)) return;

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ msg: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid email or password" });
      }

      const standardizedRole = user.role ? user.role.toLowerCase() : "member";

      const token = jwt.sign(
        { id: user._id, role: standardizedRole },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
      );

      res.status(200).json({
        token,
        role: standardizedRole,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
