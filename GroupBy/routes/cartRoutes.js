const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} = require("../controllers/cartController");
const authMiddleware =
  require("../middleware/authMiddleware");

router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addToCart);
router.put(
  "/update/:productId",
  authMiddleware,
  updateCartItem
);
router.delete(
  "/remove/:productId",
  authMiddleware,
  removeFromCart
);

module.exports = router;