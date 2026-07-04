const Product = require("../models/Product");

// ==========================================
// 1. CREATE PRODUCT
// ==========================================
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. GET ALL PRODUCTS — with search + category filter
// ==========================================
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let filter = {};

    // Category filter
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

    // Server-side search across title, description, seller
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { seller: regex },
        { category: regex },
      ];
    }

    const products = await Product.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. GET SINGLE PRODUCT BY ID
// ==========================================
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("createdBy", "name email");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. GET LOGGED-IN SELLER'S PRODUCTS
// ==========================================
exports.getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. UPDATE PRODUCT
// ==========================================
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (product.createdBy.toString() !== req.user.id.toString())
      return res.status(403).json({ success: false, message: "Not authorized to update this product" });
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: "Product updated successfully", product: updated });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. DELETE PRODUCT
// ==========================================
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (product.createdBy.toString() !== req.user.id.toString())
      return res.status(403).json({ success: false, message: "Not authorized to delete this product" });
    await product.deleteOne();
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. GET DYNAMIC CATEGORY STATS (for navbar)
// ==========================================
exports.getCategoryStats = async (req, res, next) => {
  try {
    const stats = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, categories: stats });
  } catch (error) {
    next(error);
  }
};
