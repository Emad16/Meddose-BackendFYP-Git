const express = require("express");
const router = express.Router();

//------------ Importing Controllers ------------//
const messageController = require("../controllers/messageController");

router.post("/", messageController.createMessage);
router.get("/:chatId", messageController.getMessages);

module.exports = router;
