const express = require("express");
const router = express.Router();
const { cookieJwtAuth } = require("../middleware/cookieJWTAuth.js");
const {
  createChatRoom,
  createNewChat,
  getChatRoomID,
} = require("../controllers/chatController.js");

router.post("/createRoom", cookieJwtAuth, createChatRoom);
router.post("/sendMessage", cookieJwtAuth, createNewChat);
router.post("/chatRoomID", cookieJwtAuth, getChatRoomID);
// add a GET for messages

module.exports = router;
