const Product = require("../models/productModel");

const checkStock = async (req, res, next) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "المنتج غير موجود" });

  if (product.stock < quantity) {
    return res.status(400).json({ message: "الكمية غير متوفرة بالمخزون" });
  }

  next();
};

module.exports = checkStock;
