// ✅ LINE 1: dotenv loaded first so all process.env values are available
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

const Deal = require("./models/Deal");
const Product = require("./models/Product");

// 1. INITIALIZE EXPRESS FIRST 
const app = express();

// 2. CONNECT TO DATABASE
connectDB();

// 3. DEFINE CORS PERMISSIONS POLICY
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // standard Vite port
  "https://group-buy-marketplace.vercel.app"
];

// 4. MOUNT ADVANCED CORS MIDDLEWARE BEFORE ANY INCOMING ROUTE REQUESTS
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests globally
app.options("*", cors());

// 5. PARSE REQUEST BODIES
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