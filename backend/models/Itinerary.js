const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    time: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    cost: {
      type: Number,
      min: 0,
      default: 0,
    },

    category: {
      type: String,
      enum: [
        "sightseeing",
        "food",
        "hotel",
        "transport",
        "activity",
        "other",
      ],
      default: "activity",
    },
  },
  { timestamps: true }
);

const itinerarySchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    day: {
      type: Number,
      required: true,
      min: 1,
    },

    date: {
      type: Date,
      required: true,
    },

    activities: [activitySchema],
  },
  {
    timestamps: true,
  }
);

itinerarySchema.index({ trip: 1, day: 1 });

module.exports = mongoose.model("Itinerary", itinerarySchema);