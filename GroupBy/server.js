// ✅ LINE 1: dotenv loaded first so all process.env values are available
// to every module that is required after this point.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");

const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const dealRoutes = require("./routes/dealRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const cartRoutes = require("./routes/cartRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Models are imported here so the cron job can reference them directly
// without creating a circular require chain through the route/controller layer.
const Deal = require("./models/Deal");
const Product = require("./models/Product");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "GroupBuy API Running" });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);

// ── Centralized error handler (must be last middleware) ───────────────────────
app.use(errorMiddleware);

// ─────────────────────────────────────────────────────────────────────────────
// AUTOMATED DEAL RESOLUTION — CRON JOB
// ─────────────────────────────────────────────────────────────────────────────
// Schedule: runs every minute ("* * * * *").
// For production you may want a less frequent schedule such as
// every 5 minutes ("*/5 * * * *") to reduce DB load.
//
// Logic per expired deal:
//   • joinedUsers >= targetMembers  → status = "completed"
//   • joinedUsers <  targetMembers  → status = "cancelled"
//     + If the deal has a linked Product, restore the stock that
//       was reserved for the pool (targetMembers - joinedUsers units).
// ─────────────────────────────────────────────────────────────────────────────
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    // Fetch all active deals whose deadline has passed
    const expiredDeals = await Deal.find({
      status: "active",
      deadline: { $lte: now },
    });

    if (expiredDeals.length === 0) return;

    console.log(
      `[CRON] ${new Date().toISOString()} — resolving ${expiredDeals.length} expired deal(s)`
    );

    for (const deal of expiredDeals) {
      if (deal.joinedUsers >= deal.targetMembers) {
        // ── Pool met its target: mark completed ──────────────────
        deal.status = "completed";
        await deal.save();
        console.log(`[CRON] Deal "${deal.title}" (${deal._id}) → completed`);
      } else {
        // ── Pool did NOT meet target: cancel + restore stock ─────
        deal.status = "cancelled";
        await deal.save();
        console.log(`[CRON] Deal "${deal.title}" (${deal._id}) → cancelled`);

        // Restore unreserved stock to the linked product (if any)
        if (deal.product) {
          const unfilledSlots = deal.targetMembers - deal.joinedUsers;
          const updatedProduct = await Product.findByIdAndUpdate(
            deal.product,
            { $inc: { stock: unfilledSlots } },
            { new: true }
          );
          if (updatedProduct) {
            console.log(
              `[CRON] Restored ${unfilledSlots} unit(s) to product "${updatedProduct.title}" (${deal.product})`
            );
          }
        }
      }
    }
  } catch (err) {
    // Never let a cron error crash the server process
    console.error("[CRON] Deal resolution error:", err.message);
  }
});

console.log("[CRON] Deal resolution scheduler registered (runs every minute)");

// ─────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
