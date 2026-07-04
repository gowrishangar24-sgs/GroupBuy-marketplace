// In-memory OTP store: { email: { otp, expiresAt } }
const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function saveOtp(email, otp) {
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });
}

function verifyOtp(email, otp) {
  const record = otpStore.get(email.toLowerCase());
  if (!record) return { valid: false, reason: "No OTP found for this email" };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, reason: "OTP has expired. Please request a new one." };
  }
  if (record.otp !== otp) {
    return { valid: false, reason: "Incorrect OTP" };
  }
  otpStore.delete(email.toLowerCase()); // consume after use
  return { valid: true };
}

function clearOtp(email) {
  otpStore.delete(email.toLowerCase());
}

module.exports = { generateOtp, saveOtp, verifyOtp, clearOtp };
