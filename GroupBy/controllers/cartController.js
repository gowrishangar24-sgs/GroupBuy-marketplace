const Cart = require("../models/Cart");
const Product = require("../models/Product");

const recalculateTotal = (items) => {
  return items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

// GET CART
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
      "title image price stock"
    );

    if (!cart) {
      cart = { items: [], totalAmount: 0 };
    }

    res.status(200).json({
      success: true,
      cart,
    });

  } catch (error) {
    next(error);
  }
};

// ADD TO CART
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [
          {
            product: productId,
            quantity,
            price: product.price,
          },
        ],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          price: product.price,
        });
      }
    }

    cart.totalAmount = recalculateTotal(cart.items);
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart,
    });

  } catch (error) {
    next(error);
  }
};

// UPDATE QUANTITY
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not in cart",
      });
    }

    item.quantity = quantity;
    cart.totalAmount = recalculateTotal(cart.items);
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart,
    });

  } catch (error) {
    next(error);
  }
};

// REMOVE FROM CART
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    cart.totalAmount = recalculateTotal(cart.items);
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });

  } catch (error) {
    next(error);
  }
};