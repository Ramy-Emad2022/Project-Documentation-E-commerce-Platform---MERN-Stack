const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} = require("../controllers/favoriteController");

const router = express.Router();

router.post("/:productId", protect, addToFavorites);

router.delete("/:productId", protect, removeFromFavorites);

router.get("/", protect, getFavorites);

module.exports = router;
