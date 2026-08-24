const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Trip = require("../models/Trip");
const Itinerary = require("../models/Itinerary");

const sendEmail = require("../utils/emailService");

// ==========================================
// GENERATE JWT TOKEN
// ==========================================

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ==========================================
// REGISTER
// ==========================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(
      "Register error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while creating your account",
    });
  }
};

// ==========================================
// LOGIN
// ==========================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while logging in",
    });
  }
};

// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No account found with this email address",
      });
    }

    // Generate reset token
    const resetToken =
      crypto.randomBytes(32).toString("hex");

    // Hash token before storing in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    // Token valid for 15 minutes
    user.resetPasswordExpire =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    // Frontend URL
    const frontendUrl =
      process.env.FRONTEND_URL ||
      "https://voyagemate.onrender.com";

    const resetUrl =
      `${frontendUrl}/reset-password/${resetToken}`;

    // Email HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Reset Password</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background: #f5f7f8;
            font-family: Arial, sans-serif;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: 40px auto;
              background: white;
              padding: 40px;
              border-radius: 12px;
            "
          >

            <h1 style="color: #087f98;">
              Voyage Mate
            </h1>

            <h2>
              Reset your password
            </h2>

            <p>
              We received a request to reset
              your Voyage Mate password.
            </p>

            <p>
              Click the button below to create
              a new password.
            </p>

            <div style="margin: 30px 0;">

              <a
                href="${resetUrl}"
                style="
                  display: inline-block;
                  padding: 14px 24px;
                  background: #078ca5;
                  color: white;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                "
              >
                Reset Password
              </a>

            </div>

            <p>
              This reset link will expire
              in 15 minutes.
            </p>

            <p>
              If you did not request this,
              you can safely ignore this email.
            </p>

            <p>
              — Voyage Mate
            </p>

          </div>
        </body>
      </html>
    `;

    // Send email
    await sendEmail({
      to: user.email,
      subject:
        "Reset your Voyage Mate password",
      html,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset link has been sent to your email",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to send password reset email",
    });
  }
};

// ==========================================
// RESET PASSWORD
// ==========================================

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          "Password reset token is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message:
          "New password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters",
      });
    }

    // Hash token received from email
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Password reset link is invalid or expired",
      });
    }

    // Hash new password
    const hashedPassword =
      await bcrypt.hash(password, 12);

    user.password = hashedPassword;

    // Remove reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to reset password",
    });
  }
};

// ==========================================
// GET PROFILE
// ==========================================

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch profile",
    });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      avatar,
    } = req.body;

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Name cannot be empty",
        });
      }

      user.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail =
        email.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message:
            "Email cannot be empty",
        });
      }

      const existingUser =
        await User.findOne({
          email: normalizedEmail,
          _id: {
            $ne: user._id,
          },
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists",
        });
      }

      user.email = normalizedEmail;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update profile",
    });
  }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain at least 6 characters",
      });
    }

    const user = await User.findById(
      req.user._id
    ).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from your current password",
      });
    }

    user.password =
      await bcrypt.hash(
        newPassword,
        12
      );

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to change password",
    });
  }
};

// ==========================================
// DELETE ACCOUNT
// ==========================================

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message:
          "Password is required to delete your account",
      });
    }

    const user = await User.findById(
      req.user._id
    ).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Incorrect password",
      });
    }

    await Itinerary.deleteMany({
      user: user._id,
    });

    await Trip.deleteMany({
      user: user._id,
    });

    await User.findByIdAndDelete(
      user._id
    );

    return res.status(200).json({
      success: true,
      message:
        "Account deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete account error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete account",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};