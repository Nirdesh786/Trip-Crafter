import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      enum: ["India"], // restrict to India only
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["Hill Station", "Beach", "Temple", "Historical", "Adventure"],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      default: "https://via.placeholder.com/400x300?text=No+Image",
    },

    popular: {
      type: Boolean,
      default: false,
    },

    activities: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

placeSchema.index({ state: 1 });
placeSchema.index({ category: 1 });
placeSchema.index({ popular: 1 });
placeSchema.index({ popular: 1, category: 1 });

export default mongoose.models.Place || mongoose.model("Place", placeSchema);
