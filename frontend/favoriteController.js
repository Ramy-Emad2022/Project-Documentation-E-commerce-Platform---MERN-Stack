const User = require("../models/userModel");

const addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { productId } = req.params;
    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
      res.json({
        message: "Product added to favorites",
        favorites: user.favorites,
      });
    } else {
      res.status(400).json({ message: "Product already in favorites" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { productId } = req.params;
    user.favorites = user.favorites.filter((id) => id.toString() !== productId);
    await user.save();

    res.json({
      message: "Product removed from favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
};
