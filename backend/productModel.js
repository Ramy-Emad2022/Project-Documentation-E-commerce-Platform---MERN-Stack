// models/productModel.js

const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    color: { type: [String], required: true },
    size: { type: [String], required: true },
    images: { type: [String], required: true },

    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    gender: {
      type: String,
      enum: ["Men", "Women", "Children", "Unisex"],
      // default: "Unisex",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
