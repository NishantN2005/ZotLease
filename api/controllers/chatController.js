const pool = require("../src/db.js");
require("dotenv").config("api/.env");
const { nanoid } = require("nanoid");

const createChatRoom = async (req, res) => {
  try {
    console.log("WHATTT GOIN ONNNN");
    const { userID1, userID2 } = req.body;
    console.log(userID1, userID2);

    if (!userID1 || !userID2) {
      return res
        .status(400)
        .json({ error: "Both userID1 and userID2 are required." });
    }
    if (userID1 === userID2) {
      return res
        .status(400)
        .json({ error: "userID1 and userID2 cannot be the same." });
    }

    const chatRoomID = nanoid();

    const checkQuery = {
      text: `SELECT * FROM chatRooms WHERE 
             (userID1 = $1 AND userID2 = $2) OR 
             (userID1 = $2 AND userID2 = $1)`,
      values: [userID1, userID2],
    };

    const existingRoom = await pool.query(checkQuery);
    console.log(existingRoom.rows);

    if (existingRoom.rowCount > 0) {
      return res
        .status(200)
        .json({ chatRoomID: existingRoom.rows[0].chatroomid });
    }

    const insertQuery = {
      text: `INSERT INTO chatRooms (chatRoomID, userID1, userID2) VALUES ($1, $2, $3)`,
      values: [chatRoomID, userID1, userID2],
    };

    const insertResult = await pool.query(insertQuery);

    if (insertResult.rowCount === 0) {
      throw new Error("Failed to create the chat room.");
    }

    console.log("Chat room created:", chatRoomID);

    return res.status(200).json({
      message: "Successfully created chat room.",
      success: true,
      chatRoomID,
    });
  } catch (err) {
    console.error("Error creating chat room:", err);
  }
};

const createNewChat = async (req, res) => {
  try {
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

const getChatRooms = async (req, res) => {
  try {
    const { userID } = req.body;

    // Step 1: Get chat rooms
    let selectQuery = {
      text: `SELECT * FROM chatRooms WHERE userID1 = $1 OR userID2 = $1;`,
      values: [userID],
    };
    let response = await pool.query(selectQuery);
    console.log("here", response.rows);

    // Step 2: Extract partner IDs
    const partnerIDS = response.rows.map((data) =>
      data.userid1 === userID ? data.userid2 : data.userid1
    );
    console.log("partners", partnerIDS);

    // Step 3: Fetch partner names
    const newselectQuery = {
      text: `SELECT userID, fname FROM users WHERE userID = ANY($1)`,
      values: [partnerIDS],
    };
    const newresponse = await pool.query(newselectQuery);
    console.log("partners data", newresponse.rows);

    // Step 4: Map userID to fname for easier lookup
    const partnerNames = {};
    newresponse.rows.forEach((user) => {
      partnerNames[user.userid] = user.fname;
    });

    console.log("partnerNames mapping", partnerNames);

    // Step 5: Create chatRooms object
    const chatRooms = [];

    response.rows.forEach((data) => {
      const dataObj = {};
      const partnerID = data.userid1 === userID ? data.userid2 : data.userid1;
      const unreadMessages =
        userID === data.userid1 ? data.unreadcount1 : data.unreadcount2;

      chatRooms.push({
        chatRoomID: data.chatroomid,
        partnerID: partnerID,
        unreadMessages: unreadMessages,
        partnerName: partnerNames[partnerID],
      });
    });

    console.log("newChats", chatRooms);

    return res.status(200).json({ chatRooms, success: true });
  } catch (err) {
    console.error("Error fetching chat rooms:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

// this gets all chats from database of user
const getOfflineChats = async (req, res) => {
  try {
    const { chatRoomID } = req.body;
    const selectQuery = {
      text: `SELECT * FROM messages WHERE chatRoomID = $1 ORDER BY timestamp ASC`,
      values: [chatRoomID],
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
