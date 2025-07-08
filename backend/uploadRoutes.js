const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer({ dest: "uploads/images" });

router.post("/", upload.single("profile"), (req, res) => {
  res.json({
    message: "تم رفع الصورة بنجاح!",
    file: req.file,
  });
});

module.exports = router;
