const express = require("express");
const http = require("http");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const userRoutes = require("../routes/userRoutes.js");
const authRoutes = require("../routes/authRoutes.js");
const { v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");
const subleaseRoutes = require("../routes/subleaseRoutes.js");
const activityRoutes = require("../routes/activityRoutes.js");
const chatRoutes = require("../routes/chatRoutes.js");
const pool = require("./db.js");
const cron = require("node-cron");
const { ORIGIN, IP, PORT, ENVIRONMENT } = require("../constants.js");
require("dotenv").config("api/.env");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { googleAuthController } = require("../controllers/authController.js");

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
    origin: ORIGIN,
    methods: ["GET", "POST"],
  },
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/sublease", subleaseRoutes);
app.use("/activity", activityRoutes);
app.use("/chat", chatRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.CLIENT_SECRET;
// const REDIRECT_URI = "https://www.zotlease.org/auth/google/callback";
// const REDIRECT_URI = `http://${IP}:${PORT}/auth/google/callback`;

// hardcoded
const REDIRECT_URI = `http://localhost:5555/auth/google/callback`;

const oAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

app.get("/auth/google", (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  res.redirect(authUrl);
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange the authorization code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Fetch user profile information
    const userInfo = await oAuth2Client.request({
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
    });

    const {
      email,
      given_name: firstName,
      family_name: lastName,
    } = userInfo.data;

    const { accessToken, id } = await googleAuthController(
      email,
      firstName,
      lastName,
      res
    );

    // change to production url
    // res.redirect(`${ORIGIN}/dashboard`);

    // hardcoded
    res.redirect("http://localhost:5173/dashboard");
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).send("Authentication failed");
  }
});

// Schedule the cleanup task to run once a day at midnight
cron.schedule(
  "0 0,12 * * *",
  async () => {
    console.log("Running daily database cleanup task...");

    // Clean up refresh_token_blacklist
    const cleanBlacklist = `DELETE FROM refresh_token_blacklist WHERE expiry < NOW();`;
    const respBlacklist = await pool.query(cleanBlacklist);
    console.log(
      `Cleaned blacklist db ${respBlacklist.rowCount} row(s) affected`
    );

    // Get listerid of expired subleases
    const getExpiredSubleases = `SELECT listerid FROM sublease WHERE TO_DATE(endterm, 'YYYY-MM-DD') < CURRENT_DATE;`;
    const expiredSubleases = await pool.query(getExpiredSubleases);
    const listerIds = expiredSubleases.rows.map((row) => row.listerid);

    // Delete expired subleases
    const cleanSublease = `DELETE FROM sublease WHERE TO_DATE(endterm, 'YYYY-MM-DD') < CURRENT_DATE;`;
    const respSublease = await pool.query(cleanSublease);
    console.log(`Cleaned sublease db ${respSublease.rowCount} row(s) affected`);

    // Create activity for each listerid
    const createActivityQuery = `INSERT INTO activity (id, listerid, activity, date) VALUES ($1, $2, $3, NOW())`;
    for (const listerid of listerIds) {
      const activityId = uuidv4();
      const activityText = "🫣 Your lease has expired";
      await pool.query(createActivityQuery, [
        activityId,
        listerid,
        activityText,
      ]);
      console.log(`Created activity for listerid ${listerid}`);
    }
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
  socket.on(
    "directMessage",
    ({ chatRoomID, content, id, sender, status, timestamp, recipientID }) => {
      console.log(
        chatRoomID,
        content,
        id,
        sender,
        status,
        timestamp,
        recipientID
      );
      const recipientSocketId = userSockets.get(recipientID);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("message", {
          chatRoomID,
          content,
          senderID: sender, // Send the sender's temp id for now
          status,
          timestamp,
        });
      } else {
        console.log(`Recipient ${recipientID} not connected.`);
      }
    }
  );

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
    ` Zotlease API listening at http://${IP}:${PORT} in the ${ENVIRONMENT} environment only accepting connectections from ${ORIGIN}`
  );
});
