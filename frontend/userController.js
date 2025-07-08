const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, phone, address } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const userExists = await User.findOne({ $or: [{ email }, { username }] });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
    phone,
    address,
    isAdmin: false,
    favorites: [],
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isAdmin: user.isAdmin,
      favorites: user.favorites,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isAdmin: user.isAdmin,
      favorites: user.favorites,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id || req.user.id).select(
    "-password"
  );

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isAdmin: user.isAdmin,
      favorites: user.favorites,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id || req.user.id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.address =
      req.body.address !== undefined ? req.body.address : user.address;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      isAdmin: updatedUser.isAdmin,
      favorites: updatedUser.favorites,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("المستخدم غير موجود");
  }
});

const addToFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id || req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { productId } = req.body;
  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  if (!user.favorites.includes(productId)) {
    user.favorites.push(productId);
    await user.save();
  }

  res.json({
    message: "Product added to favorites",
    favorites: user.favorites,
  });
});

const removeFromFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id || req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const productIdToRemove = req.params.productId;
  if (!productIdToRemove) {
    res.status(400);
    throw new Error("Product ID is required in URL parameters");
  }

  user.favorites = user.favorites.filter(
    (id) => id.toString() !== productIdToRemove.toString()
  );
  await user.save();

  res.json({
    message: "Product removed from favorites",
    favorites: user.favorites,
  });
});

// ***************************************************************
// الدوال الجديدة لإدارة المستخدمين بواسطة الأدمن
// ***************************************************************

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password"); // جلب كل المستخدمين واستبعاد كلمة المرور

  if (users) {
    res.json(users);
  } else {
    res.status(404);
    throw new Error("No users found");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.address =
      req.body.address !== undefined ? req.body.address : user.address;
    user.isAdmin =
      req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin; // تحديث صلاحية الأدمن

    // لو الأدمن بيغير كلمة مرور مستخدم آخر
    if (req.body.password) {
      user.password = req.body.password; // الـ pre('save') middleware هيشفرها تلقائياً
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      isAdmin: updatedUser.isAdmin,
      favorites: updatedUser.favorites,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // لمنع الأدمن من حذف نفسه بالخطأ (اختياري، لكنه إجراء أمان جيد)
    if (user._id.toString() === req.user._id.toString()) {
      // req.user هي بيانات الأدمن اللي عامل request
      res.status(400);
      throw new Error("Cannot delete your own admin account");
    }

    await user.deleteOne();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addToFavorites,
  removeFromFavorites,
  // دوال إدارة المستخدمين الجديدة:
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
