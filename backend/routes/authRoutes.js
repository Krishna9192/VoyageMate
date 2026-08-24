const express = require("express");

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC AUTH ROUTES
// ==========================================

router.post(
  "/register",
  registerUser
);

router.post(
  "/login",
  loginUser
);

router.post(
  "/forgot-password",
  forgotPassword
);

// Reset password using token from email
router.post(
  "/reset-password/:token",
  resetPassword
);

// ==========================================
// PROTECTED ACCOUNT ROUTES
// ==========================================

router.get(
  "/profile",
  protect,
  getProfile
);

router.put(
  "/profile",
  protect,
  updateProfile
);

router.put(
  "/change-password",
  protect,
  changePassword
);

router.delete(
  "/account",
  protect,
  deleteAccount
);

module.exports = router;