import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Bus from "../models/Bus.js";
import User from "../models/User.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { sendBookingConfirmationEmail } from "../services/emailService.js";

// Lazy getter — created on first use, after dotenv has populated process.env
let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID?.trim(),
      key_secret: process.env.RAZORPAY_KEY_SECRET?.trim(),
    });
  }
  return _razorpay;
};

const reserveInventoryForBooking = async (booking) => {
  if (booking.bookingType === "Hotel") {
    const hotel = await Hotel.findOneAndUpdate(
      { _id: booking.hotel, roomsAvailable: { $gt: 0 } },
      { $inc: { roomsAvailable: -1 } },
      { new: true }
    );

    if (!hotel) {
      throw new Error("Sorry, this hotel is fully booked now.");
    }

    return;
  }

  if (booking.bookingType === "Bus") {
    const bus = await Bus.findOneAndUpdate(
      { _id: booking.bus, availableSeats: { $gt: 0 } },
      { $inc: { availableSeats: -1 } },
      { new: true }
    );

    if (!bus) {
      throw new Error("Sorry, this bus is sold out now.");
    }

    return;
  }

  throw new Error("Unsupported booking type");
};

const releaseInventoryForBooking = async (booking) => {
  if (booking.bookingType === "Hotel") {
    await Hotel.findByIdAndUpdate(booking.hotel, { $inc: { roomsAvailable: 1 } });
    return;
  }

  if (booking.bookingType === "Bus") {
    await Bus.findByIdAndUpdate(booking.bus, { $inc: { availableSeats: 1 } });
  }
};

const bookingPopulateConfig = [
  {
    path: "hotel",
    select: "name location images pricePerNight place",
    populate: {
      path: "place",
      select: "name",
    },
  },
  {
    path: "bus",
    select: "operatorName busType origin destination departureTime arrivalTime images pricePerSeat",
  },
];

// @desc    Create new booking (payment pending)
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const {
      bookingType: rawBookingType,
      hotelId,
      busId,
      checkInDate,
      checkOutDate,
      travelDate,
      totalPrice,
    } = req.body;

    const bookingType = rawBookingType || (busId ? "Bus" : "Hotel");

    if (bookingType === "Hotel") {
      if (!hotelId || !checkInDate || !checkOutDate) {
        return res.status(400).json({
          message: "hotelId, checkInDate, and checkOutDate are required for hotel bookings",
        });
      }

      const hotel = await Hotel.findById(hotelId).select("roomsAvailable pricePerNight");
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      if (hotel.roomsAvailable <= 0) {
        return res.status(400).json({ message: "Sorry, this hotel is fully booked!" });
      }

      const booking = new Booking({
        user: req.user._id,
        bookingType: "Hotel",
        hotel: hotelId,
        checkInDate,
        checkOutDate,
        totalPrice,
        status: "Pending",
        paymentStatus: "Pending",
      });

      const createdBooking = await booking.save();
      return res.status(201).json(createdBooking);
    }

    if (bookingType === "Bus") {
      if (!busId) {
        return res.status(400).json({ message: "busId is required for bus bookings" });
      }

      const bus = await Bus.findById(busId).select("availableSeats departureTime pricePerSeat");
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }

      if (bus.availableSeats <= 0) {
        return res.status(400).json({ message: "Sorry, this bus is sold out!" });
      }

      const booking = new Booking({
        user: req.user._id,
        bookingType: "Bus",
        bus: busId,
        travelDate: travelDate || bus.departureTime,
        totalPrice: totalPrice ?? bus.pricePerSeat,
        status: "Pending",
        paymentStatus: "Pending",
      });

      const createdBooking = await booking.save();
      return res.status(201).json(createdBooking);
    }

    return res.status(400).json({ message: "Invalid bookingType. Use Hotel or Bus." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a real Razorpay order for a booking
// @route   POST /api/bookings/:id/payment/initiate
export const initiateBookingPayment = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "Confirmed" && booking.paymentStatus === "Paid") {
      return res.status(200).json({
        message: "Payment already completed for this booking",
        bookingId: booking._id,
        orderId: booking.paymentOrderId,
        amount: booking.totalPrice,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        message: `Cannot initiate payment for a ${booking.status} booking`,
      });
    }

    if (booking.paymentStatus === "Processing") {
      return res.status(409).json({ message: "Payment processing is already in progress" });
    }

    // Create a real Razorpay order
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(booking.totalPrice * 100), // Razorpay expects paise (₹1 = 100 paise)
      currency: "INR",
      receipt: `receipt_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        bookingType: booking.bookingType,
      },
    });

    booking.paymentStatus = "Pending";
    booking.paymentOrderId = razorpayOrder.id;
    await booking.save();

    return res.status(200).json({
      message: "Razorpay order created",
      bookingId: booking._id,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment signature and confirm booking
// @route   POST /api/bookings/:id/payment/verify
export const verifyBookingPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    // Step 1: Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment signature verification failed" });
    }

    // Step 2: Lock booking atomically to prevent double-confirmation
    const lockedBooking = await Booking.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        paymentOrderId: razorpay_order_id,
        status: "Pending",
        paymentStatus: "Pending",
      },
      { $set: { paymentStatus: "Processing" } },
      { new: true }
    );

    if (!lockedBooking) {
      const existingBooking = await Booking.findOne({ _id: req.params.id, user: req.user._id });

      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (existingBooking.status === "Confirmed" && existingBooking.paymentStatus === "Paid") {
        return res.status(200).json({
          message: "Booking already confirmed",
          booking: existingBooking,
        });
      }

      if (existingBooking.paymentStatus === "Processing") {
        return res.status(409).json({ message: "Payment verification is in progress. Try again." });
      }

      return res.status(400).json({
        message: `Cannot verify payment for ${existingBooking.status} booking`,
      });
    }

    // Step 3: Reserve inventory (seats/rooms)
    try {
      await reserveInventoryForBooking(lockedBooking);
    } catch (inventoryError) {
      lockedBooking.paymentStatus = "Failed";
      lockedBooking.status = "Cancelled";
      lockedBooking.cancelledAt = new Date();
      await lockedBooking.save();

      return res.status(409).json({ message: inventoryError.message });
    }

    // Step 4: Confirm the booking
    lockedBooking.status = "Confirmed";
    lockedBooking.paymentStatus = "Paid";
    lockedBooking.paymentId = razorpay_payment_id;
    lockedBooking.paidAt = new Date();

    const updatedBooking = await lockedBooking.save();

    // Step 5: Send confirmation email (non-blocking)
    try {
      const bookingUser = await User.findById(req.user._id).select("name email").lean();
      let hotelOrBus = null;
      if (updatedBooking.bookingType === "Hotel" && updatedBooking.hotel) {
        hotelOrBus = await Hotel.findById(updatedBooking.hotel).select("name location images").lean();
      } else if (updatedBooking.bookingType === "Bus" && updatedBooking.bus) {
        hotelOrBus = await Bus.findById(updatedBooking.bus).select("operatorName origin destination departureTime arrivalTime").lean();
      }
      if (bookingUser?.email) {
        sendBookingConfirmationEmail({
          to: bookingUser.email,
          userName: bookingUser.name,
          booking: updatedBooking.toObject(),
          hotelOrBus,
        }); // intentionally not awaited — fire and forget
      }
    } catch (emailError) {
      console.error("Email trigger error:", emailError.message);
    }

    return res.status(200).json({
      message: "Payment verified and booking confirmed",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel/refund booking
// @route   POST /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "Cancelled" || booking.status === "Refunded") {
      return res.status(200).json({ message: `Booking already ${booking.status.toLowerCase()}` });
    }

    if (booking.status === "Pending") {
      booking.status = "Cancelled";
      booking.paymentStatus = booking.paymentStatus === "Processing" ? "Failed" : booking.paymentStatus;
      booking.cancelledAt = new Date();
      const updatedPendingBooking = await booking.save();

      return res.status(200).json({
        message: "Pending booking cancelled",
        booking: updatedPendingBooking,
      });
    }

    if (booking.status === "Confirmed") {
      await releaseInventoryForBooking(booking);

      const now = new Date();
      booking.cancelledAt = now;

      if (booking.paymentStatus === "Paid") {
        booking.status = "Refunded";
        booking.paymentStatus = "Refunded";
        booking.refundedAt = now;
      } else {
        booking.status = "Cancelled";
      }

      const updatedConfirmedBooking = await booking.save();

      return res.status(200).json({
        message:
          updatedConfirmedBooking.status === "Refunded"
            ? "Booking cancelled and marked as refunded"
            : "Booking cancelled",
        booking: updatedConfirmedBooking,
      });
    }

    return res.status(400).json({ message: "Unable to cancel this booking" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by id
// @route   GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
      .populate(bookingPopulateConfig)
      .lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .select(
        "bookingType hotel bus checkInDate checkOutDate travelDate totalPrice status paymentStatus paymentOrderId paymentId paidAt cancelledAt refundedAt createdAt"
      )
      .populate(bookingPopulateConfig)
      .sort("-createdAt")
      .lean();

    res.set("Cache-Control", "private, max-age=30");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
