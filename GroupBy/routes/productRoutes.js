const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getCategoryStats,
} = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const sellerMiddleware = require("../middleware/sellerMiddleware");
const { validateProduct } = require("../middleware/validateMiddleware");

// Public
router.get("/", getProducts);
router.get("/categories/stats", getCategoryStats); // ← NEW: dynamic category counts

// Protected — must come before /:id
router.get("/seller/my-products", authMiddleware, sellerMiddleware, getMyProducts);

router.get("/:id", getProductById);

router.post("/create", authMiddleware, sellerMiddleware, validateProduct, createProduct);
router.put("/:id", authMiddleware, sellerMiddleware, updateProduct);
router.delete("/:id", authMiddleware, sellerMiddleware, deleteProduct);

module.exports = router;
