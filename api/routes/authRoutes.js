const express = require("express");
const router = express.Router();

const {
  loginController,
  refreshController,
  signupController,
} = require("../controllers/authController");

router.post("/login", loginController);
router.post("/refresh", refreshController);
router.post("/signup", signupController);

module.exports = router;
