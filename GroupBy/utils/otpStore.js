const mongoose = require("mongoose");

// 📑 Self-deleting schema directly inside the utility
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // ⏱️ Automatically expires after 10 minutes
});

const OtpModel = mongoose.models.Otp || mongoose.model("Otp", otpSchema);

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function saveOtp(email, otp) {
  const targetEmail = email.toLowerCase().trim();
  // Upserts: updates existing if present, otherwise creates new
  await OtpModel.findOneAndUpdate(
    { email: targetEmail },
    { otp, createdAt: new Date() },
    { upsert: true, new: true }
  );
}

async function verifyOtp(email, otp) {
  const targetEmail = email.toLowerCase().trim();
  const record = await OtpModel.findOne({ email: targetEmail });

  if (!record) {
    return { valid: false, reason: "No OTP found for this email" };
  }

  if (record.otp !== otp) {
    return { valid: false, reason: "Incorrect OTP" };
  }

  // Delete instantly upon successful verification match
  await OtpModel.deleteOne({ email: targetEmail });
  return { valid: true };
}

async function clearOtp(email) {
  await OtpModel.deleteOne({ email: email.toLowerCase().trim() });
}

module.exports = { generateOtp, saveOtp, verifyOtp, clearOtp };