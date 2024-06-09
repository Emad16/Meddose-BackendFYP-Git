const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  day: { type: String },
  time: { type: String },
  quantity: {
    type: Number,
    default: 1,
  },
  measurment: { type: String },
  till: { type: String },
});
//------------ Schedules Schema ------------//
const SchedulesSchema = new mongoose.Schema(
  {
    schedule: { type: [daySchema], required: true },
    medicationID: { type: mongoose.Schema.Types.ObjectId, ref: "Medications" },
  },
  { timestamps: true }
);

const Schedules = mongoose.model("Schedules", SchedulesSchema);

module.exports = Schedules;
