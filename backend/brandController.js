const Brand = require("../models/brandModel");

exports.createBrand = async (req, res) => {
  try {
    const { name, country } = req.body;
    const brand = new Brand({ name, country });
    await brand.save();
    res.status(201).json({ message: "تم إنشاء العلامة التجارية بنجاح", brand });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ", error });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ", error });
  }
};
