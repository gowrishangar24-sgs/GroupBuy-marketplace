const express = require("express");
const router = express.Router();
const {
  getSellerDashboard,
} = require("../controllers/sellerController");
const authMiddleware =
  require("../middleware/authMiddleware");
const sellerMiddleware =
  require("../middleware/sellerMiddleware");

router.get(
  "/dashboard",
  authMiddleware,
  sellerMiddleware,
  getSellerDashboard
);

module.exports = router;