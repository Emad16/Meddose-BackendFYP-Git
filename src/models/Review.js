const { Schema } = require("mongoose");
const mongoose = require("mongoose");
//------------ Categories Schema ------------//
const ReviewsSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
    },
    recieverID: { type: Schema.Types.ObjectId, ref: "User", required: true },
    review: {
      type: String,
    },
    reviewerID: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Reviews = mongoose.model("Reviews", ReviewsSchema);

module.exports = Reviews;
