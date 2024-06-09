const mongoose = require("mongoose");

const detailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  _id: {
    type: Object,
    default: "",
  },
  image: {
    type: String,
    default:
      "https://png.pngtree.com/element_our/20200610/ourmid/pngtree-medical-capsule-medicine-image_2242252.jpg",
  },
});

//------------ Medications Schema ------------//
const MedicationsSchema = new mongoose.Schema(
  {
    details: { type: [detailsSchema], required: true },
    caretaker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Medications = mongoose.model("Medications", MedicationsSchema);

module.exports = Medications;
