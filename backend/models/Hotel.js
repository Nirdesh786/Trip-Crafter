import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    location: {
      city: String,
      state: String,
      country: String,
    },
    address: String,
    description: String,
    images: [String],
    pricePerNight: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    amenities: [
      {
        type: String,
      },
    ],
    roomsAvailable: {
      type: Number,
      default: 0,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

hotelSchema.index({ place: 1 });
hotelSchema.index({ isPopular: 1 });
hotelSchema.index({ place: 1, isPopular: 1 });

export default mongoose.models.Hotel || mongoose.model("Hotel", hotelSchema);
