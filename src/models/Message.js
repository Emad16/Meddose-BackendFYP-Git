const { Schema } = require("mongoose");
const mongoose = require("mongoose");

//------------ User Schema ------------//
const MessageSchema = new mongoose.Schema(
  {
    chatId: String,
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: String,
    isFile: Boolean,
    fileName: String,
    fileType: String,
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
