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
      required: false,
    },

    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      required: false,
    },

    selectedTierPrice: {
      type: Number,
      required: function () {
        return this.status === "pledged" || this.deal != null;
      },
      default: 0,
    },

    targetMinBuyers: {
      type: Number,
      required: function () {
        return this.status === "pledged" || this.deal != null;
      },
      default: 0,
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

    status: {
      type: String,
      enum: ["pledged", "ready_to_confirm", "placed", "cancelled", "completed"],
      default: "pledged",
    },

    orderStatus: {
      type: String,
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

// Pre-save hook to ensure status and orderStatus stay in sync for backwards compatibility
orderSchema.pre("save", function (next) {
  if (this.isModified("status") && !this.isModified("orderStatus")) {
    this.orderStatus = this.status;
  } else if (this.isModified("orderStatus") && !this.isModified("status")) {
    this.status = this.orderStatus;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);