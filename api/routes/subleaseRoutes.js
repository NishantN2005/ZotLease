const express = require("express");
const router = express.Router();
const { cookieJwtAuth } = require("../middleware/cookieJWTAuth.js");
const {createSubleaseController} = require("../controllers/subleaseController.js");

router.post("/create",cookieJwtAuth, createSubleaseController);

module.exports = router;