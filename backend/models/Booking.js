import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    bookingType: {
      type: String,
      enum: ["Hotel", "Bus"],
      default: "Hotel",
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: function requiredHotel() {
        return this.bookingType === "Hotel";
      },
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: function requiredBus() {
        return this.bookingType === "Bus";
      },
    },
    checkInDate: {
      type: Date,
      required: function requiredCheckInDate() {
        return this.bookingType === "Hotel";
      },
    },
    checkOutDate: {
      type: Date,
      required: function requiredCheckOutDate() {
        return this.bookingType === "Hotel";
      },
    },
    travelDate: {
      type: Date,
      required: function requiredTravelDate() {
        return this.bookingType === "Bus";
      },
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Refunded"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Processing", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentOrderId: {
      type: String,
      trim: true,
    },
    paymentId: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ paymentOrderId: 1 }, { sparse: true });

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
