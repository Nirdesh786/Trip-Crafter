// controllers/authController.js

import crypto from "crypto";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Bus from "../models/Bus.js";
import generateToken from "../utils/generateToken.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

// ✅ REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    generateToken(res, user._id);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      generateToken(res, user._id);

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ LOGOUT
export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
};

// ✅ GET MY PROFILE (with stats)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    const [bookingCount, wishlistCount] = await Promise.all([
      Booking.countDocuments({ user: req.user._id, status: { $nin: ["Cancelled", "Refunded"] } }),
      Promise.resolve(user.wishlist?.length || 0),
    ]);

    res.status(200).json({ ...user, bookingCount, wishlistCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE PROFILE (name and/or password)
export const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to set a new password" });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      user.password = newPassword;
    }

    const updated = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+passwordResetToken +passwordResetExpires");
    if (!user) {
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail({ to: user.email, resetToken });
    res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");
    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN STATS
export const getAdminStats = async (req, res) => {
  try {
    const [totalBookings, confirmedBookings, totalRevenueAgg, userCount, hotelCount, busCount, recentBookings] =
      await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ status: "Confirmed" }),
        Booking.aggregate([{ $match: { paymentStatus: "Paid" } }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
        User.countDocuments({ role: "user" }),
        Hotel.countDocuments(),
        Bus.countDocuments(),
        Booking.aggregate([
          { $match: { paymentStatus: "Paid", createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
          { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, bookings: { $sum: 1 } } },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
      ]);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const chartData = recentBookings.map((b) => ({ month: months[b._id.month - 1], revenue: b.revenue, bookings: b.bookings }));
    res.status(200).json({ totalBookings, confirmedBookings, totalRevenue: totalRevenueAgg[0]?.total || 0, userCount, hotelCount, busCount, chartData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};