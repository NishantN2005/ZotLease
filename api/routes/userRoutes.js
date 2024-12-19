const express = require("express");
const pool = require("../src/db.js");
const router = express.Router();
const { cookieJwtAuth } = require("../middleware/cookieJWTAuth.js");
const { dummy } = require("../controllers/userController.js");

/**
 * Create new user
 * Read user data
 * Update user information
 * Delete user
 */
router.post("/");
router.post("/test", cookieJwtAuth, dummy);
// router.post("/refreshToken",cookieJwtAuth,  )

module.exports = router;
