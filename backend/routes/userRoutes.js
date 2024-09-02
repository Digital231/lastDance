const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { updateProfileValidator } = require("../validators/authValidators");
const { validationResult } = require("express-validator");

// Get all users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("username avatar");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get a specific user by ID
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "username avatar _id"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// Update user profile
router.put(
  "/update",
  authMiddleware,
  updateProfileValidator,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (req.body.username) {
        const newUsername = req.body.username;
        const existingUser = await User.findOne({ username: newUsername });
        if (existingUser && existingUser._id.toString() !== req.user.id) {
          return res.status(400).json({ message: "Username already taken." });
        }
        user.username = newUsername;
      }

      if (req.body.avatar) {
        user.avatar = req.body.avatar;
      }

      if (req.body.newPassword) {
        if (!req.body.currentPassword) {
          return res.status(400).json({
            message: "Current password is required to set a new password.",
          });
        }

        if (req.body.newPassword !== req.body.confirmNewPassword) {
          return res.status(400).json({
            message: "New password and confirmation do not match.",
          });
        }

        const isMatch = await user.comparePassword(req.body.currentPassword);
        if (!isMatch) {
          return res
            .status(400)
            .json({ message: "Current password is incorrect" });
        }

        user.password = req.body.newPassword;
      }

      await user.save();
      res.json({
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      });
    } catch (error) {
      console.error("Error in user update:", error);
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Username already exists. Please choose a different one.",
        });
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
