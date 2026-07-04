const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },

    shippingAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);