const express = require("express");
const http = require("http");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const userRoutes = require("../routes/userRoutes.js");
const authRoutes = require("../routes/authRoutes.js");
const subleaseRoutes = require("../routes/subleaseRoutes.js");
const pool = require('./db.js');
const cron = require('node-cron');
const {ORIGIN,IP,PORT,ENVIRONMENT } = require('../constants.js');
require("dotenv").config("api/.env");

const app = express();
app.use(compression());

const coorsOptions = {
  origin: ORIGIN,
  credentials: true,
};
app.use(cors(coorsOptions));
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/sublease", subleaseRoutes);

// Schedule the cleanup task to run once a day at midnight
cron.schedule('0 0,12 * * *', async() => {
    console.log('Running daily database cleanup task...');
    const cleanBlacklist = `DELETE FROM refresh_token_blacklist
WHERE expiry < NOW();`
    const resp = await pool.query(cleanBlacklist);
    console.log(`Cleaned blacklist db ${resp.rowCount} row affected`);
  }, {
    scheduled: true,
    timezone: "PST"
  });

server.listen(PORT, IP, () => {
  console.log(
    `Cellborg API listening at http://localhost:${PORT} in the ${ENVIRONMENT} environment`
  );
});
