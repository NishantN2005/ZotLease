const pool = require("../src/db.js");
require("dotenv").config("api/.env");
const { nanoid } = require("nanoid");

const createChatRoom = async (req, res) => {
  try {
    const { userID1, userID2 } = req.body;

    if (!userID1 || !userID2 || userID1 === userID2) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    const chatRoomID = nanoid();

    // maybe create check for existing chat room

    const insertQuery1 = {
      text: `INSERT INTO chatRooms (chatRoomID, userID1, userID2) VALUES ($1, $2, $3)`,
      values: [chatRoomID, userID1, userID2],
    };
    const res1 = await pool.query(insertQuery1);
    console.log("Inserted userIDS:", res1);

    return res
      .status(200)
      .json({ message: "Successfully Created Chatroom", success: true });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const createNewChat = async (req, res) => {
  try {
    console.log("cahtin");
    const id = nanoid();
    const { chatRoomID, sender, content } = req.body;
    const timestamp = new Date();
    const status = "sent";

    // Insert the message
    const insertQuery = {
      text: `INSERT INTO messages (id, chatRoomID, sender, content, timestamp, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
      values: [id, chatRoomID, sender, content, timestamp, status], // change tempSender back to sender
    };

    let response = await pool.query(insertQuery);
    console.log("Message inserted:", response.rowCount);

    const validateQuery = {
      text: `SELECT * FROM chatRooms
         WHERE chatRoomID = $1 AND (userID1 = $2 OR userID2 = $2)`,
      values: [chatRoomID, sender],
    };

    const validationResponse = await pool.query(validateQuery);
    if (validationResponse.rowCount === 0) {
      throw new Error("Sender is not a participant in the chat room");
    }
    console.log("Validation successful: Sender is a participant");

    const incrementQuery1 = {
      text: `UPDATE chatRooms
         SET unreadCount1 = unreadCount1 + 1
         WHERE chatRoomID = $1 AND userID1 != $2`,
      values: [chatRoomID, sender],
    };

    const incrementQuery2 = {
      text: `UPDATE chatRooms
         SET unreadCount2 = unreadCount2 + 1
         WHERE chatRoomID = $1 AND userID2 != $2`,
      values: [chatRoomID, sender],
    };

    response = await pool.query(incrementQuery1);
    console.log(response);

    response = await pool.query(incrementQuery2);
    console.log(response);

    const messageData = {
      id,
      chatRoomID,
      sender,
      content,
      timestamp,
      status,
    };

    return res.status(200).json({ messageData, success: true });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const getChatRoomID = async (req, res) => {
  try {
    const { userID1, userID2 } = req.body;
    console.log("user", userID1, "user", userID2);

    const selectQuery = {
      text: `SELECT chatRoomID FROM chatRooms WHERE (userID1 = $1 AND userID2 = $2) OR (userID1 = $2 AND userID2 = $1)`,
      values: [userID1, userID2],
    };
    const response = await pool.query(selectQuery);
    console.log(response);

    return res
      .status(200)
      .json({ chatRoomID: response.rows[0].chatroomid, success: true });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

// gets chat rooms user is involved in
const getChatRooms = async (req, res) => {
  try {
    const { userID } = req.body;
    const selectQuery = {
      text: `SELECT * FROM chatRooms WHERE userID1 = $1 OR userID2 = $1;`,
      values: [userID],
    };
    const response = await pool.query(selectQuery);
    return res.status(200).json({ chatRooms: response.rows, success: true });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

// this gets all chats from database of user
const getOfflineChats = async (req, res) => {
  try {
    const { chatRooms } = req.body;
    console.log("room", chatRooms);
    const chatRoomIDS = chatRooms.map((chat) => chat.chatroomid);
    const selectQuery = {
      text: `SELECT * FROM messages WHERE chatRoomID = ANY($1)`,
      values: [chatRoomIDS],
    };
    const response = await pool.query(selectQuery);
    return res.status(200).json({ messages: response.rows, success: true });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports = {
  createChatRoom,
  createNewChat,
  getChatRoomID,
  getChatRooms,
  getOfflineChats,
};
