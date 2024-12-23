const express = require("express");
const router = express.Router();
const { cookieJwtAuth } = require("../middleware/cookieJWTAuth.js");
const {createSubleaseController, getSubleasesController} = require("../controllers/subleaseController.js");

router.post("/create",cookieJwtAuth, createSubleaseController);
router.post("/retrieve", cookieJwtAuth, getSubleasesController);
module.exports = router;