const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────
// TIER SCHEMA
// Each tier defines the group price unlocked when the pool
// reaches `minUsers` members. Example:
//   [
//     { minUsers: 5,  price: 1999 },   // ≥5  people → ₹1999
//     { minUsers: 10, price: 1499 },   // ≥10 people → ₹1499
//     { minUsers: 20, price: 999  },   // ≥20 people → ₹999
//   ]
// The UI should always display the currently-active tier price,
// which is the highest minUsers tier that joinedUsers satisfies.
// ─────────────────────────────────────────────────────────────
const tierSchema = new mongoose.Schema(
  {
    minUsers: {
      type: Number,
      required: [true, "Tier minUsers is required"],
      min: [1, "minUsers must be at least 1"],
    },
    price: {
      type: Number,
      required: [true, "Tier price is required"],
      min: [0, "Tier price cannot be negative"],
    },
  },
  { _id: false } // No separate _id per tier subdocument
);

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Deal title is required"],
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    // ── Pricing ──────────────────────────────────────────────
    originalPrice: {
      type: Number,
      required: [true, "Original price is required"],
      min: 0,
    },

    // REPLACED: flat `groupPrice: Number`  →  dynamic tiers array
    tiers: {
      type: [tierSchema],
      validate: {
        validator(arr) {
          return Array.isArray(arr) && arr.length >= 1;
        },
        message: "At least one pricing tier is required",
      },
    },

    // ── Group sizing ──────────────────────────────────────────
    targetMembers: {
      type: Number,
      required: [true, "Target members is required"],
      min: 2,
    },

    joinedUsers: {
      type: Number,
      default: 0,
    },

    // ── Timing ───────────────────────────────────────────────
    // `deadline` is the absolute UTC timestamp used by the cron
    // job to determine expiry. Stored alongside `daysLeft` (which
    // is still displayed in the UI) so both representations coexist.
    deadline: {
      type: Date,
      required: [true, "Deal deadline is required"],
    },

    daysLeft: {
      type: Number,
      default: 7,
    },

    // ── Metadata ──────────────────────────────────────────────
    seller: {
      type: String,
      default: "Unknown Seller",
    },

    category: {
      type: String,
      enum: [
        "electronics",
        "home-kitchen",
        "beauty",
        "clothing",
        "health",
        "sports",
        "toys-books",
      ],
      lowercase: true,
      trim: true,
      default: "electronics",
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },

    // Reference to the linked Product document (optional).
    // When a deal is cancelled the cron job uses this to restore stock.
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
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

// ─────────────────────────────────────────────────────────────
// VIRTUAL: activeTierPrice
// Returns the current unlocked group price based on joinedUsers.
// Falls back to the first (lowest) tier if no threshold is met.
// ─────────────────────────────────────────────────────────────
dealSchema.virtual("activeTierPrice").get(function () {
  if (!this.tiers || this.tiers.length === 0) return null;

  // Sort descending by minUsers; pick the first tier whose
  // minUsers threshold joinedUsers has already crossed.
  const sorted = [...this.tiers].sort((a, b) => b.minUsers - a.minUsers);
  const active = sorted.find((t) => this.joinedUsers >= t.minUsers);

  // If no threshold has been crossed yet, show the lowest tier price
  // as the "entry" group price so the UI always has something to display.
  return active ? active.price : sorted[sorted.length - 1].price;
});

// Include virtuals when converting to JSON (for API responses)
dealSchema.set("toJSON", { virtuals: true });
dealSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Deal", dealSchema);
