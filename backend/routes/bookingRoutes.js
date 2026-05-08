import express from "express";
import {
  cancelBooking,
  createBooking,
  getBookingById,
  getUserBookings,
  initiateBookingPayment,
  verifyBookingPayment,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createBooking);
router.route("/mybookings").get(protect, getUserBookings);
router.route("/:id").get(protect, getBookingById);
router.route("/:id/payment/initiate").post(protect, initiateBookingPayment);
router.route("/:id/payment/verify").post(protect, verifyBookingPayment);
router.route("/:id/cancel").post(protect, cancelBooking);

export default router;
