const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendOrderConfirmationEmail } = require("../utils/mailer");

// HELPER: Validate Mongoose ObjectId format
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// CREATE ORDER
exports.createOrder = async (req, res, next) => {
  try {
    const { productId, quantity, shippingAddress } = req.body;

    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Product ID",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    const totalPrice = product.price * quantity;

    const order = await Order.create({
      buyer: req.user.id,
      product: productId,
      quantity,
      totalPrice,
      shippingAddress: shippingAddress?.trim() || "",
    });

    // Reduce stock
    product.stock -= quantity;
    await product.save();

    // Select only safe fields during population
    await order.populate("product", "title image price -_id");

    // Send order confirmation email — non-blocking, doesn't fail the order if mail fails
    try {
      const buyer = await User.findById(req.user.id).select("email");
      if (buyer?.email) {
        await sendOrderConfirmationEmail(buyer.email, order, order.product);
      }
    } catch (mailErr) {
      console.error("Order confirmation email failed:", mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    next(error);
  }
};

// GET MY ORDERS (Differentiates between Buyer and Seller views)
// GET MY ORDERS (Fixed to show personal purchases for all roles)
exports.getMyOrders = async (req, res, next) => {
  try {
    // 💡 FIX: Every user (whether buyer or seller) should see the orders THEY purchased
    const query = { buyer: req.user.id };

    const orders = await Order.find(query)
      .populate("product", "title image price seller")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    next(error);
  }
};

// GET SINGLE ORDER (Dual Authorization for both Buyer and Seller)
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID format",
      });
    }

    const order = await Order.findById(id).populate(
      "product",
      "title image price seller"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Moderate Security Enforcement: 
    // Allow access ONLY if the user is the buyer OR the seller of the product
    const isBuyer = order.buyer.toString() === req.user.id.toString();
    const isSeller = order.product && order.product.seller?.toString() === req.user.id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    next(error);
  }
};

// CANCEL ORDER
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID format",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only the buyer who created the order can initiate a cancellation
    if (order.buyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    if (
      order.orderStatus === "shipped" ||
      order.orderStatus === "delivered" ||
      order.orderStatus === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify an order that is shipped, delivered, or already cancelled",
      });
    }

    order.orderStatus = "cancelled";
    order.paymentStatus = "refunded";

    // Restore stock safely
    if (order.product) {
      const product = await Product.findById(order.product);
      if (product) {
        product.stock += order.quantity;
        await product.save();
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });

  } catch (error) {
    next(error);
  }
};