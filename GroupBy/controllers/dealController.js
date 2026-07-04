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
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ success: false, message: "Deal not found" });
    if (deal.status !== "active") return res.status(400).json({ success: false, message: "This deal is no longer active" });
    if (deal.joinedUsers >= deal.targetMembers) return res.status(400).json({ success: false, message: "Deal is already full" });

    deal.joinedUsers += 1;
    if (deal.joinedUsers >= deal.targetMembers) deal.status = "completed";
    await deal.save();

    const obj = deal.toJSON();
    obj.daysLeft = computeDaysLeft(deal.deadline);
    obj.activeTierPrice = getActiveTierPrice(deal);

    let message;
    if (deal.status === "completed") {
      message = `Joined! Deal is now complete. Final group price: ₹${obj.activeTierPrice}`;
    } else {
      const nextTier = [...deal.tiers].sort((a, b) => a.minUsers - b.minUsers).find((t) => t.minUsers > deal.joinedUsers);
      if (nextTier) {
        const needed = nextTier.minUsers - deal.joinedUsers;
        message = `Joined! Current price: ₹${obj.activeTierPrice}. ${needed} more member(s) unlock ₹${nextTier.price}.`;
      } else {
        message = `Joined deal successfully. Current group price: ₹${obj.activeTierPrice}`;
      }
    }

    res.status(200).json({ success: true, message, deal: obj });
  } catch (error) {
    next(error);
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
