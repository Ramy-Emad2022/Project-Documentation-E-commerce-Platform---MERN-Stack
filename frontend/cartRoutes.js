const express = require("express");

const {
  addToCart,

  removeFromCart,

  getCart,

  updateCartItem,

  clearCart,
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware.protect, getCart);

router.post("/add", authMiddleware.protect, addToCart);

router.put("/update/:productId", authMiddleware.protect, updateCartItem);

router.delete("/remove/:itemId", authMiddleware.protect, removeFromCart);

router.delete("/clear", authMiddleware.protect, clearCart);

module.exports = router;
