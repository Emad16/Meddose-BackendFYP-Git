const { Schema } = require("mongoose");
const mongoose = require("mongoose");

//------------ MoodList Schema ------------//
const MoodListSchema = new mongoose.Schema(
  {
    mood: { type: String, required: true },
    emotion: { type: String, required: true },
    color: { type: String, required: true },
  },
  { timestamps: true }
);

const MoodList = mongoose.model("MoodList", MoodListSchema);

module.exports = MoodList;
