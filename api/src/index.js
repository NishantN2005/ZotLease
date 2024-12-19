const express = require("express");
const http = require("http");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const userRoutes = require("../routes/userRoutes.js");
const authRoutes = require("../routes/authRoutes.js");
require("dotenv").config("api/.env");

const IP = "0.0.0.0";
const PORT = 5555;
const app = express();
app.use(compression());

const coorsOptions = {
  origin: "http://localhost:5176",
  credentials: true,
};
app.use(cors(coorsOptions));
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/user", userRoutes);
app.use("/auth", authRoutes);

server.listen(PORT, IP, () => {
  console.log(
    `Cellborg API listening at http://localhost:${PORT} in the dev environment`
  );
});
