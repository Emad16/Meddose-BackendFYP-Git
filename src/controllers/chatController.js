const Chat = require("../models/Chat");
const Message = require("../models/Message");

exports.findUserChats = async (req, res) => {
  const userId = req.params.userId;
  await Chat.find({ members: { $in: [userId] } }).then((chat) => {
    return res.json(chat);
  });
};

exports.findChat = async (req, res) => {
  const { firstId, secondId } = req.params;
  try {
    const chats = await Chat.findOne({
      members: { $all: [firstId, secondId] },
    });
    res.json({ error: false, chats });
  } catch (error) {
    console.log(error);
    res.json({ error: true, message: error.message });
  }
};

exports.createChat = async (req, res) => {
  try {
    const { firstId, secondId } = req.body;
    const chat = await Chat.findOne({ members: { $all: [firstId, secondId] } });

    if (chat) {
      const messages = await Message.find({ chatId: chat._id })
        .populate("senderId")
        .exec();
      return res
        .status(200)
        .json({ error: false, messages, chatId: chat?._id });
    }

    const newChat = new Chat({ members: [firstId, secondId] });
    newChat
      .save()
      .then((chat) => {
        res.json({ error: false, messages: [], chatId: chat._id });
      })
      .catch((err) => res.json({ error: true, message: err.message }));
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
};
