const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrdersForUser,
  deleteOrder,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);

router.get("/myorders", protect, getOrdersForUser);

router.delete("/:id", protect, deleteOrder);

module.exports = router;
