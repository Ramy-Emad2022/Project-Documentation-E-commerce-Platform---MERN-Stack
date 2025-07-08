const Category = require("../models/categoryModel");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    await category.save();
    res.status(201).json({ message: "تم إنشاء التصنيف بنجاح", category });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ", error });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ", error });
  }
};
