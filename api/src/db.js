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
// (async () => {
//   //await client.connect()
//   console.log("successfully connected to client");
//   const createTableQuery = `
//   CREATE TABLE IF NOT EXISTS users (
//     id SERIAL PRIMARY KEY,
//     fname VARCHAR(100) NOT NULL,
//     lname VARCHAR(100) NOT NULL,
//     email VARCHAR(100) UNIQUE NOT NULL,
//     password TEXT NOT NULL,
//     userID TEXT UNIQUE NOT NULL
//   );
// `;
//   const insert = {
//     text: "INSERT INTO users(fname,lname,email,password,userID) VALUES ($1,$2,$3,$4,$5)",
//     values: ["Nishant", "Nuthalapati", "example@gmail.com", "hello", "01"],
//   };
//   const check = `SELECT * FROM users`;
//   const res = await pool.query(check);
//   console.log("Table created successfully", res);
// })();
module.exports = pool;
