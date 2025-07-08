// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  // استيراد الدوال الجديدة لإدارة المستخدمين
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController"); // تأكد من مسار الـ controller

// استيراد protect و admin middleware
const { protect, admin } = require("../middleware/authMiddleware"); // تأكد من مسار الـ middleware

// الـ routes للمستخدمين (Authentication)
router.post("/signup", registerUser);
router.post("/login", loginUser);

router
  .route("/profile")
  .get(protect, getUserProfile) // حماية route الـ profile
  .put(protect, updateUserProfile); // حماية route تحديث الـ profile

// ***************************************************************
// الـ Routes لإدارة المستخدمين (Admin Management)
// هذه الـ routes تتطلب تسجيل دخول (protect) وصلاحيات مدير (admin)
// ***************************************************************

router
  .route("/") // GET /api/users (لجلب كل المستخدمين) و POST (لو عايز تضيف مستخدم جديد كأدمن - اختياري)
  .get(protect, admin, getUsers); // حماية route جلب كل المستخدمين بـ protect و admin

router
  .route("/:id") // GET /api/users/:id (لجلب مستخدم معين) و PUT و DELETE
  .get(protect, admin, getUserById) // حماية route جلب مستخدم بالـ ID
  .put(protect, admin, updateUser) // حماية route تحديث مستخدم
  .delete(protect, admin, deleteUser); // حماية route حذف مستخدم

module.exports = router;
