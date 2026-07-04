const express = require("express");
const router = express.Router();
const {
  sendOtp,
  signup,
  login,
  getProfile,
  checkUsername,
  forgotPassword, // 👈 Added
  resetPassword
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Send OTP before signup
router.post("/send-otp", sendOtp);

// Complete signup (with OTP verification)
router.post("/signup", signup);

// Login
router.post("/login", login);

// Get profile (protected)
router.get("/profile", authMiddleware, getProfile);

// Check username availability
router.get("/check-username", checkUsername);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
