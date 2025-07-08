const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createProduct,
  getProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.post("/", upload.array("images", 5), createProduct); // 'images' هو اسم الـ field وهنسمح بحد أقصى 5 صور مثلاً

router.get("/", getProducts);

router.get("/search", searchProducts);

router.get("/:id", getProductById);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

module.exports = router;
