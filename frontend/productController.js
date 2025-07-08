const cloudinary = require("../config/cloudinary");
const Product = require("../models/productModel");

const createProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files uploaded." });
    }

    const imageUrls = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
      );
      imageUrls.push(result.secure_url);
    }

    const { name, description, size, color, price, category, stock, gender } =
      req.body;

    const sizesArray = JSON.parse(size);
    const colorsArray = JSON.parse(color);

    const product = await Product.create({
      name,
      description,
      size: sizesArray,
      color: colorsArray,
      price,
      images: imageUrls,
      category,
      stock,
      gender,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create product." });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    console.log("Searching for:", query);

    const regex = new RegExp(`\\b${query}\\b`, "i");
    console.log("الـ Regex المتكون:", regex);

    const results = await Product.find({
      $or: [{ name: { $regex: regex } }, { description: { $regex: regex } }],
      stock: { $gt: 0 },
    }).limit(20);

    res.json(results);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ message: "Error during search" });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, color, size, gender } =
      req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    product.category = category || product.category;
    product.color = color ? JSON.parse(color) : product.color;
    product.size = size ? JSON.parse(size) : product.size;
    product.gender = gender || product.gender;

    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
        );
        imageUrls.push(result.secure_url);
      }
      product.images = imageUrls;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({ message: "Product removed successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  searchProducts,
  deleteProduct,
};
