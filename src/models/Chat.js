const { Schema } = require("mongoose");
const mongoose = require("mongoose");

//------------ User Schema ------------//
const ChatSchema = new mongoose.Schema(
  {
    members: Array,
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
