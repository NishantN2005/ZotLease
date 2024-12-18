const express = require("express");
const router = express.Router();
const {
  loginController,
  refreshController,
} = require("../controllers/authController");

router.post("/login", loginController);
router.post("/refresh", refreshController);

module.exports = router;
