const express = require("express");
const router = express.Router();
const { cookieJwtAuth } = require("../middleware/cookieJWTAuth.js");
const {createSubleaseController, 
    getSubleasesController, 
    getSubleaseInfoController,
    getSubleaseFilterController, 
    deleteSubleaseController,
    getSubleaseFromController,
    getLandingLocationsController} = require("../controllers/subleaseController.js");

router.post("/create",cookieJwtAuth, createSubleaseController);
router.post("/retrieve", cookieJwtAuth, getSubleasesController);
router.post("/fromUser", cookieJwtAuth, getSubleaseFromController);
router.post("/selectedInfo", cookieJwtAuth, getSubleaseInfoController);
router.post("/filter", cookieJwtAuth, getSubleaseFilterController);
router.post("/delete", cookieJwtAuth, deleteSubleaseController);
router.get('/getLandingLocations', getLandingLocationsController);
module.exports = router;