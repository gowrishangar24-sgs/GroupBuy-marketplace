const express = require("express");
const router = express.Router();
const {
  createDeal,
  getDeals,
  getDealById,
  getMyDeals,
  joinDeal,
  deleteDeal,
  getDealCategoryStats,
} = require("../controllers/dealController");
const authMiddleware = require("../middleware/authMiddleware");
const sellerMiddleware = require("../middleware/sellerMiddleware");
const { validateDeal } = require("../middleware/validateMiddleware");

// Public
router.get("/", getDeals);
router.get("/categories/stats", getDealCategoryStats); // ← NEW

// Protected — must come before /:id
router.get("/my-deals", authMiddleware, getMyDeals);

router.get("/:id", getDealById);

router.post("/create", authMiddleware, sellerMiddleware, validateDeal, createDeal);
router.put("/join/:id", authMiddleware, joinDeal);
router.delete("/:id", authMiddleware, sellerMiddleware, deleteDeal);

module.exports = router;
