const sendNotification = require("../config/notification");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

// getMessages
exports.getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await Message.find({ chatId });
    res.json({ error: false, messages });
  } catch (error) {
    console.log(error);
    res.json({ error: true, message: error.message });
  }
};

exports.createMessage = async (req, res) => {
  const { chatId, senderId, text, isFile, fileType, fileName } = req.body;

  const message = new Message({
    chatId,
    senderId,
    text,
    isFile,
    fileType,
    fileName,
  });
  try {
    const response = await message.save();
    const messages = await Message.find({ chatId: response.chatId })
      .populate("senderId")
      .exec();
    const FindChat = await Chat.findOne({ _id: chatId });
    const Reciever = FindChat.members.filter((userId) => userId != senderId);

    await sendNotification({
      message: text,
      external_id: Reciever[0],
      title: "New Message",
    });
    return res.json({ error: false, messages });
    // return res.json({ error: false, response: response });
  } catch (error) {
    console.log(error);
    res.json({ error: true, message: error.message });
  }
};
