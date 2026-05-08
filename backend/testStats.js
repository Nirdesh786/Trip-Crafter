import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Booking from "./models/Booking.js";
import Hotel from "./models/Hotel.js";
import Bus from "./models/Bus.js";

dotenv.config();

const testStats = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");
    
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
      
    console.log("Stats ran successfully:");
    console.log({ totalBookings, confirmedBookings, totalRevenueAgg, userCount, hotelCount, busCount, recentBookings });
    process.exit(0);
  } catch (error) {
    console.error("Stats Error:", error);
    process.exit(1);
  }
};

testStats();
