const Wishlist = require("../models/Wishlist");

// GET WISHLIST
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({
      user: req.user.id,
    }).populate("products", "title image price seller category");

    if (!wishlist) {
      wishlist = { products: [] };
    }

    res.status(200).json({
      success: true,
      wishlist,
    });

  } catch (error) {
    next(error);
  }
};

// ADD TO WISHLIST
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: [productId],
      });
    } else {
      if (wishlist.products.includes(productId)) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist",
        });
      }

      wishlist.products.push(productId);
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: "Added to wishlist",
      wishlist,
    });

  } catch (error) {
    next(error);
  }
};

// REMOVE FROM WISHLIST
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      wishlist,
    });

  } catch (error) {
    next(error);
  }
};