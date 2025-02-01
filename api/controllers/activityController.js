const { text } = require("express");
const pool = require("../src/db.js");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config("api/.env");

const addActivityController = async (req, res) => {
  try {
    const { activity, listerid } = req.body;
    if (!activity || !listerid) {
      return res.status(400).json({ message: "Params are incomplete" });
    }

    // Format the current date as yyyy-mm-dd
    const currentDate = new Date().toISOString().split('T')[0];

    const addActivityQuery = {
      text: `INSERT INTO activity (id, activity, listerid, date) VALUES ($1, $2, $3, $4)`,
      values: [uuidv4(), activity, listerid, currentDate],
    };
    const response = await pool.query(addActivityQuery);
    if (response.rowCount === 1) {
      return res.status(200).json({ message: "Activity added" });
    } else {
      return res.status(400).json({ message: "Failed to add activity" });
    }
  } catch (error) {
    console.error("Error adding activity:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getActivityController = async(req, res) => {
    const {listerid} = req.body;

    if (!listerid) {
      return res.status(400).json({ message: "Params are incomplete" });
    }
    const query = {
        text: `SELECT * FROM activity WHERE listerid = $1`,
        values: [listerid]
    }
    const response = await pool.query(query);
    console.log(response);

    res.status(200).json(response.rows);
};

module.exports = { addActivityController,getActivityController };