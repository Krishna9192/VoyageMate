const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER NAME
    // ==========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // EMAIL
    // ==========================================

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ==========================================
    // PASSWORD
    // ==========================================

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    // ==========================================
    // AVATAR
    // ==========================================

    avatar: {
      type: String,
      default: "",
    },

    // ==========================================
    // PASSWORD RESET
    // ==========================================

    resetPasswordToken: {
      type: String,
      default: undefined,
    },

    resetPasswordExpire: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);