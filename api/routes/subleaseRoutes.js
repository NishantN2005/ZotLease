const express = require("express");
const router = express.Router();
const { cookieJwtAuth } = require("../middleware/cookieJWTAuth.js");
const {
  createSubleaseController,
  getSubleasesController,
  getSubleaseInfoController,
  getSubleaseFilterController,
  deleteSubleaseController,
  getSubleaseFromController,
  getLandingLocationsController,
} = require("../controllers/subleaseController.js");

router.post("/create", cookieJwtAuth, createSubleaseController);
router.post("/retrieve", getSubleasesController);
router.post("/fromUser", cookieJwtAuth, getSubleaseFromController);
router.post("/selectedInfo", getSubleaseInfoController);
router.post("/filter", getSubleaseFilterController);
router.post("/delete", cookieJwtAuth, deleteSubleaseController);
router.get("/getLandingLocations", getLandingLocationsController);
module.exports = router;
