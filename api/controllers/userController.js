const pool = require("../src/db.js");
require("dotenv").config("api/.env");

const dummy = async (req, res) => {
  res.status(200).send({ message: "it worked" });
};

module.exports = { dummy};
