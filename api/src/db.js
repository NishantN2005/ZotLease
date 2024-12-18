const { Pool } = require("pg");
const fs = require("fs");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: "",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync("src/rds-combined-ca-bundle.pem").toString(), // if you're using SSL
  },
});

module.exports = pool;
