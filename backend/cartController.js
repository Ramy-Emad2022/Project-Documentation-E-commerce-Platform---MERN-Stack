const mongoose = require("mongoose");

const Cart = require("../models/cartModel");

const Product = require("../models/productModel");

const populateCartItems = async (cart) => {
  if (!cart) return null;

  return await cart.populate({
    path: "items.productId",

    select:
      "name price images image description category stock gender color size",
  });
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;

    const userId = req.user.id;

    console.log("🟢 Received Data:", { userId, productId, quantity });

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      console.log("🆕 Creating a new cart...");

      cart = new Cart({
        userId,

        items: [
          {
            productId: mongoose.Types.ObjectId.createFromHexString(productId),

            quantity,

            size,
          },
        ],
      });
    } else {
      console.log("🛒 Existing cart found:", cart);

      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId && item.size === size
      );

      if (itemIndex >= 0) {
        console.log("🔄 Updating existing product quantity...");

        cart.items[itemIndex].quantity += quantity;
      } else {
        console.log("➕ Adding new product to cart...");

        cart.items.push({
          productId: mongoose.Types.ObjectId.createFromHexString(productId),

          quantity,

          size,
        });
      }
    }

    await cart.save();
    const populatedCart = await populateCartItems(cart);

    console.log("✅ Cart Updated and Populated:", populatedCart);

    res.json({ items: populatedCart.items });
  } catch (error) {
    console.error("❌ Error adding to cart:", error);

    res.status(500).json({ message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });

      await cart.save();
    }

    const populatedCart = await populateCartItems(cart);

    console.log("🛒 Fetched Cart:", populatedCart);

    res.json({ items: populatedCart.items });
  } catch (error) {
    console.error("❌ Error fetching cart:", error);

    res.status(500).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const userId = req.user.id;

    console.log("📦 ItemId to remove:", itemId);

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid itemId" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    await cart.save();

    const populatedCart = await populateCartItems(cart);

    console.log("Product Removed. Updated Cart:", populatedCart);

    res.json({ items: populatedCart.items });
  } catch (error) {
    console.error("❌ Error removing from cart:", error);

    res.status(500).json({ message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "السلة غير موجودة" });
    }

    cart.items = [];

    await cart.save();

    res.json({ message: "✅ تم تفريغ السلة بنجاح", items: [] });
  } catch (error) {
    console.error("❌ Error clearing cart:", error);

    res.status(500).json({ message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const { quantity } = req.body;

    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid itemId" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.equals(itemId));

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    const product = await Product.findById(cart.items[itemIndex].productId);

    if (!product) {
      return res

        .status(404)

        .json({ message: "Product linked to cart item not found" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: `الكمية المطلوبة غير متوفرة. الكمية المتاحة هي ${product.stock}.`,
      });
    }

    if (quantity < 0) {
      return res.status(400).json({ message: "الكمية لا يمكن أن تكون سالبة." });
    }

    cart.items[itemIndex].quantity = quantity;

    await cart.save();

    const populatedCart = await populateCartItems(cart);

    console.log("Cart Updated. Updated Cart:", populatedCart);

    res.json({ items: populatedCart.items });
  } catch (error) {
    console.error("❌ Error updating cart item:", error);

    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addToCart,

  getCart,

  removeFromCart,

  updateCartItem,

  clearCart,
};
