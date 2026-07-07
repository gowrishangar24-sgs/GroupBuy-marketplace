const nodemailer = require("nodemailer");
const dns = require("dns");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false 
  },
  // 🔥 Forces Nodemailer to resolve only IPv4 endpoints to bypass Render's ENETUNREACH block
  lookup: (hostname, options, callback) => {
    return dns.lookup(hostname, { family: 4 }, callback);
  }
});

// ─────────────────────────────────────────
// 1. Send OTP Email (Signup Verification)
// ─────────────────────────────────────────
async function sendOtpEmail(toEmail, otp) {
  const mailOptions = {
    from: `"GroupBuy" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "Your GroupBuy Email Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #1a1a1a; margin-bottom: 8px;">Verify your email</h2>
        <p style="color: #555; margin-bottom: 24px;">Use the code below to complete your GroupBuy registration. It expires in <strong>10 minutes</strong>.</p>
        <div style="background: #212529; color: #fff; font-size: 36px; font-weight: bold; letter-spacing: 12px; text-align: center; padding: 20px 32px; border-radius: 8px; margin-bottom: 24px;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// ─────────────────────────────────────────
// 2. Send Order Confirmation Email
// ─────────────────────────────────────────
async function sendOrderConfirmationEmail(toEmail, order, product) {
  const mailOptions = {
    from: `"GroupBuy" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "Your GroupBuy Order Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #1a1a1a; margin-bottom: 8px;">Order Placed! 🎉</h2>
        <p style="color: #555; margin-bottom: 24px;">Thanks for your order. Here are the details:</p>
        <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding:6px 0; color:#777;">Product</td><td style="padding:6px 0; font-weight:bold;">${product?.title || "N/A"}</td></tr>
          <tr><td style="padding:6px 0; color:#777;">Quantity</td><td style="padding:6px 0; font-weight:bold;">${order.quantity}</td></tr>
          <tr><td style="padding:6px 0; color:#777;">Total</td><td style="padding:6px 0; font-weight:bold;">₹${order.totalPrice}</td></tr>
          <tr><td style="padding:6px 0; color:#777;">Payment Mode</td><td style="padding:6px 0; font-weight:bold;">Cash on Delivery</td></tr>
          <tr><td style="padding:6px 0; color:#777;">Shipping Address</td><td style="padding:6px 0; font-weight:bold;">${order.shippingAddress || "-"}</td></tr>
        </table>
        <p style="color: #999; font-size: 13px;">Order ID: ${order._id}</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// ─────────────────────────────────────────
// 3. Send Reset OTP Email (Password Recovery)
// ─────────────────────────────────────────
async function sendResetOtpEmail(toEmail, otp) {
  const mailOptions = {
    from: `"GroupBuy Support" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "Reset Your GroupBuy Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #dc3545; margin-bottom: 8px;">Password Reset Request</h2>
        <p style="color: #555; margin-bottom: 24px;">Use the verification code below to update your password securely. This code expires in <strong>10 minutes</strong>.</p>
        <div style="background: #212529; color: #fff; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 15px; border-radius: 8px; margin-bottom: 24px;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 13px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Unified module exports configuration
module.exports = { 
  sendOtpEmail, 
  sendOrderConfirmationEmail, 
  sendResetOtpEmail 
};