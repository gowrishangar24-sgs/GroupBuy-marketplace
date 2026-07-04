const User = require("../models/User");
const Product = require("../models/Product");
const Deal = require("../models/Deal");
const Order = require("../models/Order");

exports.getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalSellers,
      totalBuyers,
      totalProducts,
      totalDeals,
      totalOrders,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "seller" }),
      User.countDocuments({ role: "buyer" }),
      Product.countDocuments(),
      Deal.countDocuments(),
      Order.countDocuments(),
    ]);

    const revenueData = await Order.find({
      paymentStatus: "paid",
    }).select("totalPrice");

    const totalRevenue = revenueData.reduce(
      (sum, o) => sum + o.totalPrice,
      0
    );

    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentOrders = await Order.find()
      .populate("product", "title price")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    const activeDeals = await Deal.countDocuments({
      status: "active",
    });

    res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalSellers,
        totalBuyers,
        totalProducts,
        totalDeals,
        totalOrders,
        totalRevenue,
        activeDeals,
        recentUsers,
        recentOrders,
      },
    });

  } catch (error) {
    next(error);
  }
};

// GET ALL USERS
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {
    next(error);
  }
};

// DELETE USER
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};