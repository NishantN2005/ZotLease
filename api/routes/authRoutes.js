const express = require("express");
const router = express.Router();

const {
  loginController,
  refreshController,
  signupController,
  logoutController,
} = require("../controllers/authController");

router.post("/login", loginController);
router.post("/refresh", refreshController);
router.post("/signup", signupController);
router.post("/logout", logoutController);

module.exports = router;
