const express = require("express");

const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


// REGISTER
router.post("/register", async (req, res) => {

  try {

    const {
      name,
      email,
      password
    } = req.body;

    // CHECK USER EXISTS
    const existingUser =
      await User.findOne({ email });

    if (existingUser) {

      return res.status(400).json({
        msg: "User already exists"
      });
    }

    // HASH PASSWORD
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // CREATE USER
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Member"
    });

    res.json({
      msg: "Registration Successful"
    });

  } catch (err) {

    res.status(500).json({
      msg: "Registration Failed"
    });
  }
});


// LOGIN
router.post("/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    // FIND USER
    const user =
      await User.findOne({ email });

    if (!user) {

      return res.status(400).json({
        msg: "Invalid Email"
      });
    }

    // CHECK PASSWORD
    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {

      return res.status(400).json({
        msg: "Invalid Password"
      });
    }

    // TOKEN
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      token,
      role: user.role
    });

  } catch (err) {

    res.status(500).json({
      msg: "Login Failed"
    });
  }
});

module.exports = router;