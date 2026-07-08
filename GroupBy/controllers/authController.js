const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { generateOtp, saveOtp, verifyOtp } = require("../utils/otpStore");
const { sendOtpEmail, sendResetOtpEmail } = require("../utils/mailer");

// ─────────────────────────────────────────
// STEP 1: Send OTP to email before signup
// ─────────────────────────────────────────
exports.sendOtp = async (req, res, next) => {
  try {
    const { email: rawEmail, username } = req.body;

    if (!rawEmail || !rawEmail.includes("@")) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    // ✅ FIX: Force lowercase and trim to ensure matching storage keys
    const email = rawEmail.toLowerCase().trim();

    // Check email uniqueness
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    // Check username uniqueness (if provided at this step)
    if (username) {
      const usernameExists = await User.findOne({ username: username.trim() });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: "Username is already taken" });
      }
    }

    const otp = generateOtp();
    await saveOtp(email, otp);

    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please check your inbox.",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// STEP 2: Verify OTP + complete signup
// ─────────────────────────────────────────
exports.signup = async (req, res, next) => {
  try {
    const { username, name, dob, email: rawEmail, password, otp, role } = req.body;

    // ✅ FIX: Match the lowercase trimmed email key variant
    const email = rawEmail.toLowerCase().trim();

    // Validate OTP
    const otpResult = await verifyOtp(email, otp);
    if (!otpResult.valid) {
      return res.status(400).json({ success: false, message: otpResult.reason });
    }

    // Re-check uniqueness (race condition safety)
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const usernameExists = await User.findOne({ username: username.trim() });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: "Username is already taken" });
    }

    // Validate password: must contain at least one letter and one number
    const passwordValid = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/.test(password);
    if (!passwordValid) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters and include both letters and numbers",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      name,
      dob,
      email,
      password: hashedPassword,
      role: role || "buyer",
      isEmailVerified: true,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// LOGIN (email + password only)
// ─────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// GET PROFILE
// ─────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// CHECK USERNAME AVAILABILITY
// ─────────────────────────────────────────
exports.checkUsername = async (req, res, next) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ available: false });
    const exists = await User.findOne({ username: username.trim() });
    res.status(200).json({ available: !exists });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// STEP 1: Verify Email & Send Reset OTP
// ─────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email address" });
    }

    const otp = generateOtp();
    await saveOtp(email.toLowerCase().trim(), otp);

    await sendResetOtpEmail(user.email, otp);

    res.status(200).json({
      success: true,
      message: "Reset verification code dispatched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// STEP 2: Validate OTP & Save New Password
// ─────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const targetEmail = email.toLowerCase().trim();

    // Verify code validation status
    const otpResult = await  verifyOtp(targetEmail, otp);
    if (!otpResult.valid) {
      return res.status(400).json({ success: false, message: otpResult.reason });
    }

    // Enforce default cryptographic password validation rules
    const passwordValid = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/.test(newPassword);
    if (!passwordValid) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters and include both letters and numbers",
      });
    }

    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User account context not found" });
    }

    // Encrypt the fresh password value string
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};