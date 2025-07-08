const Product = require("../models/productModel");
const Order = require("../models/orderModel");

const createOrder = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Authentication required to create an order. Please log in.",
      });
    }

    const { items, shippingAddress, totalPrice, status } = req.body;
    const userId = req.user._id;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No order items found. Please add items to your cart.",
      });
    }

    const orderItems = [];
    let calculatedTotalPrice = 0;

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({
          message: `Missing product ID for one or more items: ${JSON.stringify(
            item
          )}`,
        });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: `Product not found for ID: ${item.productId}. It might have been removed.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}.`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image:
          product.images && product.images.length > 0
            ? product.images[0]
            : null,
        price: product.price,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
      });

      calculatedTotalPrice += product.price * item.quantity;

      product.stock -= item.quantity;
      await product.save();
    }

    if (Math.abs(calculatedTotalPrice - totalPrice) > 0.01) {
      return res.status(400).json({
        message:
          "Total price mismatch. Please refresh your cart and try again. The calculated total does not match the provided total.",
      });
    }

    const order = new Order({
      user: userId,
      orderItems: orderItems,
      shippingAddress: shippingAddress,
      totalPrice: calculatedTotalPrice,
      status: status || "Processing",
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({
      message: error.message || "Server error during order creation.",
    });
  }
};

const getOrdersForUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Authentication required to view orders. Please log in.",
      });
    }

    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .populate({
        path: "orderItems.product",
        select: "name price images description",
      })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error in getOrdersForUser:", error);
    res
      .status(500)
      .json({ message: error.message || "Server error fetching user orders." });
  }
};

const deleteOrder = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Authentication required to delete an order. Please log in.",
      });
    }

    const orderId = req.params.id;
    const userId = req.user._id;

    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid order ID format." });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this order." });
    }

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    console.error("Error in deleteOrder:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid order ID provided." });
    }
    res.status(500).json({
      message: error.message || "Server error during order deletion.",
    });
  }
};

module.exports = {
  createOrder,
  getOrdersForUser,
  deleteOrder,
};
