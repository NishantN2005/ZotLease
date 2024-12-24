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

    const insertQuery = {
      text: `INSERT INTO chatRooms (chatRoomID, userID1, userID2) VALUES ($1, $2, $3)`,
      values: [chatRoomID, userID1, userID2],
    };
    const response = await pool.query(insertQuery);
    console.log(response);

    return res
      .status(200)
      .json({ message: "Successfully Created Chatroom", success: true });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const createNewChat = async (req, res) => {
  try {
    const id = nanoid();
    const { chatRoomID, sender, content } = req.body;
    const timestamp = new Date();
    const status = "sent";

    const insertQuery = {
      text: `INSERT INTO messages (id, chatRoomID, sender, content, timestamp, status)
      VALUES ($1, $2, $3, $4, $5, $6)`,
      values: [id, chatRoomID, sender, content, timestamp, status],
    };
    const response = await pool.query(insertQuery);
    console.log(response);

    return res.status(200).json({ message: "Message Sent", success: true });
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

module.exports = {
  createChatRoom,
  createNewChat,
  getChatRoomID,
};
