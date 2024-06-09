const mongoose = require("mongoose");
//------------ Requests Schema ------------//
const RequestsSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    caretaker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    requestBy: {
      type: String,
      required: true,
      default: "caretaker",
    },
  },
  { timestamps: true }
);

const Requests = mongoose.model("Requests", RequestsSchema);

module.exports = Requests;
