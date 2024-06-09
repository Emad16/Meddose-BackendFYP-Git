const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  document: { type: String },
});

//------------ User Schema ------------//
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetLink: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      // required: true,
    },
    userType: {
      type: String,
      required: true,
    },
    speciality: {
      type: String,
    },
    disease: {
      type: String,
    },
    profile: {
      type: String,
      default:
        "https://www.shutterstock.com/image-vector/vector-medical-icon-doctor-image-600nw-1170228883.jpg",
    },
    description: { type: String },
    careTaker: { type: Schema.Types.ObjectId, ref: "User", default: null },
    pateintList: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
