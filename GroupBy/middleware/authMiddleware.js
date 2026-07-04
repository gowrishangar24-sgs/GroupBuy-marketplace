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

    // Verify token cryptographic signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ OPTIMIZATION: Pass token payload properties directly to the req object
    // Saves a database query (User.findById) on every single protected API hit!
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