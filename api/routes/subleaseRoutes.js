const express = require("express");
const router = express.Router();
const { cookieJwtAuth } = require("../middleware/cookieJWTAuth.js");
const {createSubleaseController, getSubleasesController, getSubleaseInfoController,getSubleaseFilterController, deleteSubleaseController} = require("../controllers/subleaseController.js");

router.post("/create",cookieJwtAuth, createSubleaseController);
router.post("/retrieve", cookieJwtAuth, getSubleasesController);
router.post("/selectedInfo", cookieJwtAuth, getSubleaseInfoController);
router.post("/filter", cookieJwtAuth, getSubleaseFilterController);
router.post("/delete", cookieJwtAuth, deleteSubleaseController);
module.exports = router;