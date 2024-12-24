const express = require("express");
const router = express.Router();
const { cookieJwtAuth } = require("../middleware/cookieJWTAuth.js");
const {
  createChatRoom,
  createNewChat,
  getChatRoomID,
  getChatRooms,
  getOfflineChats,
} = require("../controllers/chatController.js");

router.post("/createRoom", cookieJwtAuth, createChatRoom);
router.post("/sendMessage", cookieJwtAuth, createNewChat);
router.post("/chatRoomID", cookieJwtAuth, getChatRoomID);
router.post("/getChatRooms", cookieJwtAuth, getChatRooms);
router.post("/getOfflineChats", cookieJwtAuth, getOfflineChats);
// add a GET for messages

module.exports = router;
