const express = require("express");
const pool = require("../src/db.js");
const router = express.Router();
const { cookieJwtAuth } = require("../middleware/cookieJWTAuth.js");
const { dummy } = require("../controllers/userController.js");

router.post("/test", cookieJwtAuth, dummy);

module.exports = router;
