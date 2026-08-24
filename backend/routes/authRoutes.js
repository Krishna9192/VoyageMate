const express = require("express");

const {
  registerUser,
  loginUser,
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

router.post("/register", registerUser);

router.post("/login", loginUser);

// ==========================================
// PROTECTED USER ROUTES
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