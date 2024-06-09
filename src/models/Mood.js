const { Schema } = require("mongoose");
const mongoose = require("mongoose");

//------------ Moods Schema ------------//
const MoodsSchema = new mongoose.Schema(
  {
    mood: { type: Schema.Types.ObjectId, ref: "MoodList", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

const Moods = mongoose.model("Moods", MoodsSchema);

module.exports = Moods;
