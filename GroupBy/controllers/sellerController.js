const Product = require("../models/Product");
const Deal = require("../models/Deal");
const Order = require("../models/Order");

exports.getSellerDashboard = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const [totalProducts, totalDeals, myProducts] =
      await Promise.all([
        Product.countDocuments({ createdBy: sellerId }),
        Deal.countDocuments({ createdBy: sellerId }),
        Product.find({ createdBy: sellerId }).select("_id"),
      ]);

    const productIds = myProducts.map((p) => p._id);

    const totalOrders = await Order.countDocuments({
      product: { $in: productIds },
    });

    const revenueData = await Order.find({
      product: { $in: productIds },
      paymentStatus: "paid",
    }).select("totalPrice");

    const totalRevenue = revenueData.reduce(
      (sum, o) => sum + o.totalPrice,
      0
    );

    const recentOrders = await Order.find({
      product: { $in: productIds },
    })
      .populate("product", "title price")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    const activeDeals = await Deal.countDocuments({
      createdBy: sellerId,
      status: "active",
    });

    const completedDeals = await Deal.countDocuments({
      createdBy: sellerId,
      status: "completed",
    });

    res.status(200).json({
      success: true,
      dashboard: {
        totalProducts,
        totalDeals,
        totalOrders,
        totalRevenue,
        activeDeals,
        completedDeals,
        recentOrders,
      },
    });

  } catch (error) {
    next(error);
  }
};