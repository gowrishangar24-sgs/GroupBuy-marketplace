const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    category: {
  type: String,
  required: [true, "Category is required"],
  enum: [
    "electronics",
    "home-kitchen",
    "beauty",
    "clothing",
    "health",
    "sports",
    "toys-books"
  ],
  lowercase: true, // ✅ Automatically downcases strings before validation
  trim: true
},

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },

    description: {
      type: String,
      default: "",
    },

    seller: {
      type: String,
      default: "Unknown Seller",
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);