const pool = require("../src/db.js");
require("dotenv").config("api/.env");
const { nanoid } = require("nanoid");
const { sendUnreadMessagesNotification } = require("./notificationController");

const createChatRoom = async (req, res) => {
  try {
    const { userID1, userID2 } = req.body;

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

    if (existingRoom.rowCount > 0) {
      return res
        .status(200)
        .json({ chatRoomID: existingRoom.rows[0].chatroomid });
    }

    const insertQuery = {
      text: `INSERT INTO chatRooms (chatRoomID, userID1, userID2) VALUES ($1, $2, $3) RETURNING *`,
      values: [chatRoomID, userID1, userID2],
    };

    const insertResult = await pool.query(insertQuery);

    if (insertResult.rowCount === 0) {
      throw new Error("Failed to create the chat room.");
    }

    const data = insertResult.rows[0];

    const partnerID = data.userid1 === userID1 ? data.userid2 : data.userid1;
    const unreadMessages =
      userID1 === data.userid1 ? data.unreadcount1 : data.unreadcount2;

    const selection = {
      text: `SELECT fname FROM users WHERE userID = $1`,
      values: [partnerID],
    };

    const selectionResult = await pool.query(selection);
    const fname = selectionResult.rows[0].fname;

    const dataObj = {
      partnerID,
      unreadMessages,
      chatRoomID: data.chatroomid,
      partnerName: fname,
    };

    return res.status(200).json({
      message: "Successfully created chat room.",
      success: true,
      chatRoomID,
      newChatRoom: dataObj,
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

    const recipient =
      sender === validationResponse.rows[0].userid1
        ? validationResponse.rows[0].userid2
        : validationResponse.rows[0].userid1;

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

    response = await pool.query(incrementQuery2);

    return res.status(200).json({ messageData, success: true });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const getChatRoomID = async (req, res) => {
  try {
    const { userID1, userID2 } = req.body;

    const selectQuery = {
      text: `SELECT chatRoomID FROM chatRooms WHERE (userID1 = $1 AND userID2 = $2) OR (userID1 = $2 AND userID2 = $1)`,
      values: [userID1, userID2],
    };
    const response = await pool.query(selectQuery);

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

    // Step 2: Extract partner IDs
    const partnerIDS = response.rows.map((data) =>
      data.userid1 === userID ? data.userid2 : data.userid1
    );

    // Step 3: Fetch partner names
    const newselectQuery = {
      text: `SELECT userID, fname FROM users WHERE userID = ANY($1)`,
      values: [partnerIDS],
    };
    const newresponse = await pool.query(newselectQuery);

    // Step 4: Map userID to fname for easier lookup
    const partnerNames = {};
    newresponse.rows.forEach((user) => {
      partnerNames[user.userid] = user.fname;
    });

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
      chatRooms.sort((a, b) => b.unreadMessages - a.unreadMessages);
    });

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

const updateUnreadCount = async (req, res) => {
  try {
    const { userID, chatRooms } = req.body;

    for (const chat of chatRooms) {
      // Update unreadCount1 for userID1
      const changeQuery1 = {
        text: `UPDATE chatRooms
               SET unreadCount1 = $1
               WHERE chatRoomID = $2 AND userID1 = $3`,
        values: [chat.unreadMessages, chat.chatRoomID, userID],
      };

      // Update unreadCount2 for userID2
      const changeQuery2 = {
        text: `UPDATE chatRooms
               SET unreadCount2 = $1
               WHERE chatRoomID = $2 AND userID2 = $3`,
        values: [chat.unreadMessages, chat.chatRoomID, userID],
      };

      // Execute the queries
      let response = await pool.query(changeQuery1);

      response = await pool.query(changeQuery2);
    }

    // Send a success response
    res.status(200).json({ message: "Unread counts updated successfully." });
  } catch (error) {
    console.error("Error updating unread counts:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating unread counts." });
  }
};

module.exports = {
  createChatRoom,
  createNewChat,
  getChatRoomID,
  getChatRooms,
  getOfflineChats,
  updateUnreadCount,
};
