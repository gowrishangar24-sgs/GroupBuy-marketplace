const validateSignup = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Name is required",
    });
  }

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Valid email is required",
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  const allowedRoles = ["buyer", "seller", "admin"];
  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Role must be buyer, seller, or admin",
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Valid email is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  next();
};

const validateProduct = (req, res, next) => {
  const { title, price, category } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Product title is required",
    });
  }

  if (!price || isNaN(price) || price < 0) {
    return res.status(400).json({
      success: false,
      message: "Valid price is required",
    });
  }

  if (!category) {
    return res.status(400).json({
      success: false,
      message: "Category is required",
    });
  }

  next();
};

// ─────────────────────────────────────────────────────────────
// UPDATED: validateDeal
// Now validates the `tiers` array instead of a flat `groupPrice`.
// Also validates `deadline` (ISO date string) instead of `daysLeft`
// being the only time reference.
//
// Expected request body shape:
// {
//   title: "Sony Headphones Group Buy",
//   originalPrice: 5000,
//   tiers: [
//     { minUsers: 5,  price: 3999 },
//     { minUsers: 10, price: 2999 },
//     { minUsers: 20, price: 1999 },
//   ],
//   targetMembers: 20,
//   deadline: "2025-09-30T23:59:59.000Z",  // ISO string
//   ...
// }
// ─────────────────────────────────────────────────────────────
const validateDeal = (req, res, next) => {
  const { title, originalPrice, tiers, targetMembers, deadline } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Deal title is required",
    });
  }

  if (!originalPrice || isNaN(originalPrice) || Number(originalPrice) < 0) {
    return res.status(400).json({
      success: false,
      message: "Valid original price is required",
    });
  }

  // ── Tiers validation ─────────────────────────────────────────
  if (!Array.isArray(tiers) || tiers.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one pricing tier is required",
    });
  }

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];

    if (
      tier.minUsers === undefined ||
      isNaN(tier.minUsers) ||
      Number(tier.minUsers) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: `Tier ${i + 1}: minUsers must be a positive number`,
      });
    }

    if (
      tier.price === undefined ||
      isNaN(tier.price) ||
      Number(tier.price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: `Tier ${i + 1}: price must be a non-negative number`,
      });
    }

    if (Number(tier.price) >= Number(originalPrice)) {
      return res.status(400).json({
        success: false,
        message: `Tier ${i + 1}: group price (₹${tier.price}) must be less than original price (₹${originalPrice})`,
      });
    }
  }

  // ── Target members ───────────────────────────────────────────
  if (!targetMembers || isNaN(targetMembers) || Number(targetMembers) < 2) {
    return res.status(400).json({
      success: false,
      message: "Target members must be at least 2",
    });
  }

  // ── Deadline ─────────────────────────────────────────────────
  if (!deadline) {
    return res.status(400).json({
      success: false,
      message: "Deal deadline is required",
    });
  }

  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Deal deadline must be a valid date",
    });
  }

  if (deadlineDate <= new Date()) {
    return res.status(400).json({
      success: false,
      message: "Deal deadline must be a future date",
    });
  }

  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateProduct,
  validateDeal,
};
