const express = require("express");
const router = express.Router();
const { cookieJwtAuth } = require("../middleware/cookieJWTAuth.js");

const { addActivityController, getActivityController} = require("../controllers/activityController");

router.post("/addActivity",cookieJwtAuth, addActivityController);
router.post("/getActivity",cookieJwtAuth, getActivityController);
module.exports = router;
