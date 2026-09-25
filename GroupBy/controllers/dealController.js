const Deal = require("../models/Deal");

function computeDaysLeft(deadline) {
  if (!deadline) return 0;
  const msLeft = new Date(deadline) - Date.now();
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
}

function getActiveTierPrice(deal) {
  if (!deal.tiers || deal.tiers.length === 0) return null;
  const sorted = [...deal.tiers].sort((a, b) => b.minUsers - a.minUsers);
  const active = sorted.find((t) => deal.joinedUsers >= t.minUsers);
  return active ? active.price : sorted[sorted.length - 1].price;
}

exports.createDeal = async (req, res, next) => {
  try {
    const { deadline, daysLeft, ...rest } = req.body;
    const deadlineDate = new Date(deadline);
    const computedDaysLeft = daysLeft !== undefined ? Number(daysLeft) : computeDaysLeft(deadlineDate);
    const deal = await Deal.create({
      ...rest,
      deadline: deadlineDate,
      daysLeft: computedDaysLeft,
      joinedUsers: 0,
      status: "active",
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, message: "Deal created successfully", deal });
  } catch (error) {
    next(error);
  }
};

exports.getDeals = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};

    if (status) filter.status = status;

    // Normalize category filter
    if (category) {
      const c = category.trim().toLowerCase();
      if (c.includes("home") || c.includes("kitchen"))        filter.category = "home-kitchen";
      else if (c.includes("toy") || c.includes("book") || c.includes("game")) filter.category = "toys-books";
      else if (c.includes("beauty"))                          filter.category = "beauty";
      else if (c.includes("clothing") || c.includes("fashion")) filter.category = "clothing";
      else if (c.includes("sport") || c.includes("outdoor")) filter.category = "sports";
      else if (c.includes("electronic") || c.includes("gadget")) filter.category = "electronics";
      else if (c.includes("health"))                          filter.category = "health";
      else                                                    filter.category = c;
    }

    // Server-side search
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { seller: regex },
      ];
    }

    const deals = await Deal.find(filter).populate("createdBy", "name email").sort({ createdAt: -1 });

    const hydratedDeals = deals.map((d) => {
      const obj = d.toJSON();
      obj.daysLeft = computeDaysLeft(d.deadline);
      obj.activeTierPrice = getActiveTierPrice(d);
      return obj;
    });

    res.status(200).json({ success: true, count: hydratedDeals.length, deals: hydratedDeals });
  } catch (error) {
    next(error);
  }
};

exports.getDealById = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id).populate("createdBy", "name email");
    if (!deal) return res.status(404).json({ success: false, message: "Deal not found" });
    const obj = deal.toJSON();
    obj.daysLeft = computeDaysLeft(deal.deadline);
    obj.activeTierPrice = getActiveTierPrice(deal);
    res.status(200).json({ success: true, deal: obj });
  } catch (error) {
    next(error);
  }
};

exports.getMyDeals = async (req, res, next) => {
  try {
    const deals = await Deal.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    const hydratedDeals = deals.map((d) => {
      const obj = d.toJSON();
      obj.daysLeft = computeDaysLeft(d.deadline);
      obj.activeTierPrice = getActiveTierPrice(d);
      return obj;
    });
    res.status(200).json({ success: true, count: hydratedDeals.length, deals: hydratedDeals });
  } catch (error) {
    next(error);
  }
};

exports.joinDeal = async (req, res, next) => {
  try {
    const Order = require("../models/Order");

    // 4. Ensure user authentication attached properly
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized: Missing authentication token" });
    }
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid user context" });
    }

    // 2. Fetch the deal record first
    const dealId = req.params.id || req.body.dealId;
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ success: false, message: "Deal not found" });
    if (deal.status !== "active") return res.status(400).json({ success: false, message: "This deal is no longer active" });

    let { tierId, shippingAddress, quantity = 1 } = req.body;

    // Locate tier directly from database if tierId supplied
    let matchedTier = null;
    if (tierId && Array.isArray(deal.tiers)) {
      matchedTier = deal.tiers.find(
        (t) => (t._id && t._id.toString() === tierId.toString()) || t.id === tierId
      );
    }

    // 1 & 3. Derive target members and price directly from the DB record rather than relying strictly on req.body
    const target = req.body.targetMembers ||
      (matchedTier ? (matchedTier.minUsers || matchedTier.targetMembers || matchedTier.targetMinBuyers) : null) ||
      deal.targetMembers ||
      deal.tiers?.[0]?.minUsers ||
      5;

    const price = req.body.price ||
      req.body.selectedTierPrice ||
      (matchedTier ? matchedTier.price : null) ||
      deal.tiers?.[0]?.price ||
      deal.originalPrice;

    const targetMinBuyers = req.body.targetMinBuyers || target;
    const selectedTierPrice = price;

    // Ensure database deal record has targetMembers populated to prevent Mongoose schema validation failure
    if (!deal.targetMembers) {
      deal.targetMembers = target;
    }

    if (deal.joinedUsers >= deal.targetMembers) {
      return res.status(400).json({ success: false, message: "Deal is already full" });
    }

    // Reject request if target milestone is already completed/locked
    if (deal.joinedUsers >= Number(targetMinBuyers)) {
      return res.status(400).json({
        success: false,
        message: `The milestone for ${targetMinBuyers} buyers has already been completed and locked.`,
      });
    }

    // Check if user already joined this deal
    if (!deal.participants) deal.participants = [];
    const alreadyJoined = deal.participants.some(
      (p) => (p.user && p.user.toString() === userId.toString()) || p.toString() === userId.toString()
    );
    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: "You have already pledged for this deal.",
      });
    }

    deal.participants.push({ user: userId, joinedAt: new Date() });
    deal.joinedUsers = deal.participants.length;

    // Create pledged Order
    const newOrder = await Order.create({
      buyer: userId,
      deal: deal._id,
      product: deal.product || null,
      selectedTierPrice: Number(selectedTierPrice),
      targetMinBuyers: Number(targetMinBuyers),
      quantity: Number(quantity),
      totalPrice: Number(selectedTierPrice) * Number(quantity),
      shippingAddress: shippingAddress || "",
      status: "pledged",
      orderStatus: "pledged",
    });

    // Milestone Evaluation:
    // Update all pledged orders associated with this deal whose targetMinBuyers <= deal.joinedUsers
    const pledgedOrders = await Order.find({
      deal: deal._id,
      status: "pledged",
      targetMinBuyers: { $lte: deal.joinedUsers },
    });

    for (const ord of pledgedOrders) {
      ord.status = "ready_to_confirm";
      ord.orderStatus = "ready_to_confirm";
      await ord.save();
    }

    // Reset workflow: When the milestone/target goal is reached, reset joinedUsers to 0 and empty participants
    let poolReset = false;
    if (deal.joinedUsers >= deal.targetMembers) {
      deal.joinedUsers = 0;
      deal.participants = [];
      deal.status = "active";
      poolReset = true;
    }
    await deal.save();

    const refreshedOrder = await Order.findById(newOrder._id)
      .populate("deal", "title image originalPrice seller tiers")
      .populate("product", "title image price seller");

    const obj = deal.toJSON();
    obj.daysLeft = computeDaysLeft(deal.deadline);
    obj.activeTierPrice = getActiveTierPrice(deal);

    let message = `Pledged deal successfully at ₹${selectedTierPrice}!`;
    if (refreshedOrder && refreshedOrder.status === "ready_to_confirm") {
      message += " 🎉 Milestone reached! Order is ready to confirm.";
    }
    if (poolReset) {
      message += " 🚀 Milestone goal reached! Pool counters reset for a fresh round.";
    }

    return res.status(200).json({ success: true, message, deal: obj, order: refreshedOrder, poolReset });
  } catch (error) {
    // 5. Ensure the response returns JSON on failure
    return res.status(400).json({ success: false, message: error.message || "Failed to join deal" });
  }
};

exports.deleteDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ success: false, message: "Deal not found" });
    if (deal.createdBy.toString() !== req.user.id.toString())
      return res.status(403).json({ success: false, message: "Not authorized to delete this deal" });
    await deal.deleteOne();
    res.status(200).json({ success: true, message: "Deal deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// GET CATEGORY STATS FOR DYNAMIC NAV
exports.getDealCategoryStats = async (req, res, next) => {
  try {
    const stats = await Deal.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, categories: stats });
  } catch (error) {
    next(error);
  }
};
