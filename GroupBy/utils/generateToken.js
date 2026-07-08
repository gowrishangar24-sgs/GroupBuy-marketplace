const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  // ✅ Fallback architecture: Reads whichever key variant is present in the environment
  const secret = process.env.JWT_SECRET || process.env.JWT_SECRETKEY;

  if (!secret) {
    console.error("❌ CRITICAL ERROR: JWT Secret key configuration is completely missing!");
  }

  return jwt.sign(
    { id: user._id, role: user.role }, 
    secret, 
    { expiresIn: "30d" }
  );
};

module.exports = generateToken;