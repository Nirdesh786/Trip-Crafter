import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    operatorName: { type: String, required: true },
    busType: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    pricePerSeat: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    images: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

busSchema.index({ origin: 1 });
busSchema.index({ destination: 1 });
busSchema.index({ departureTime: 1 });
busSchema.index({ origin: 1, destination: 1, departureTime: 1 });

export default mongoose.models.Bus || mongoose.model("Bus", busSchema);
