const express = require("express");
const http = require("http");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const userRoutes = require("../routes/userRoutes.js");
const authRoutes = require("../routes/authRoutes.js");
const { disconnect } = require("process");
const { Server } = require("socket.io");
const subleaseRoutes = require("../routes/subleaseRoutes.js");
const pool = require("./db.js");
const cron = require("node-cron");
const { ORIGIN, IP, PORT, ENVIRONMENT } = require("../constants.js");
require("dotenv").config("api/.env");
const jwt = require("jsonwebtoken");

const app = express();
app.use(compression());

const coorsOptions = {
  origin: ORIGIN,
  credentials: true,
};
app.use(cors(coorsOptions));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/sublease", subleaseRoutes);

// Schedule the cleanup task to run once a day at midnight
cron.schedule(
  "0 0,12 * * *",
  async () => {
    console.log("Running daily database cleanup task...");
    const cleanBlacklist = `DELETE FROM refresh_token_blacklist
WHERE expiry < NOW();`;
    const resp = await pool.query(cleanBlacklist);
    console.log(`Cleaned blacklist db ${resp.rowCount} row affected`);
  },
  {
    scheduled: true,
    timezone: "PST",
  }
);

const userSockets = new Map();

io.on("connection", (socket) => {
  console.log(`User connected with socket ID ${socket.id}`);

  // make sure to include userID in leasing card/listing
  // i could include senderID if we need it
  socket.on("directMessage", ({ recipientID, content }) => {
    const recipientSocketId = userSockets.get(recipientID);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("message", {
        content,
        senderID: socket.id, // Send the sender's socket ID for now, change to sender ID later
        timestamp: new Date(),
      });
    } else {
      console.log(`Recipient ${recipientID} not connected.`);
    }
  });

  socket.on("setUser", (userID) => {
    userSockets.set(userID, socket.id);
    console.log(`User ${userID} set with socket ID ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [userID, socketId] of userSockets) {
      if (socketId === socket.id) {
        userSockets.delete(userID);
        console.log(`User ${userID} disconnected.`);
        break;
      }
    }
  });
});

server.listen(PORT, IP, () => {
  console.log(
    `Cellborg API listening at http://localhost:${PORT} in the ${ENVIRONMENT} environment`
  );
});
