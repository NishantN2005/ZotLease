const { Pool } = require("pg");
const fs = require("fs");
require("dotenv").config();
const { SSL_PATH } = require("../constants.js");
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: "postgres",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync(SSL_PATH).toString(), // if you're using SSL
  },
});
module.exports = pool;
