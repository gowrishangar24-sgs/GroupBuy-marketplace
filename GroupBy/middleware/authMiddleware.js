const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // ✅ FIX: Match the environment fallback pattern (supports both JWT_SECRET and JWT_SECRETKEY)
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRETKEY;

    // Verify token cryptographic signature using the resolved secret key
    const decoded = jwt.verify(token, secret);

    // ✅ OPTIMIZATION: Pass token payload properties directly to the req object
    req.user = {
      id: decoded.id,
      role: decoded.role // Now safely available for your role middleware downstream
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;