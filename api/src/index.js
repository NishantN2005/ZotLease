const express = require("express");
const http = require("http");
const cors = require("cors");
const compression = require("compression");
const { Pool } = require("pg");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const userRoutes = require("../routes/userRoutes.js");
const authRoutes = require("../routes/authRoutes.js");
require("dotenv").config("api/.env");

const IP = "0.0.0.0";
const PORT = 5555;
const app = express();
app.use(compression());

const coorsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(coorsOptions));
const server = http.createServer(app);
app.use(express.json());
app.use(cookieParser());

app.use("/", userRoutes);
app.use("/auth", authRoutes);

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

server.listen(PORT, IP, () => {
  console.log(
    `Cellborg API listening at http://localhost:${PORT} in the dev environment`
  );
});
