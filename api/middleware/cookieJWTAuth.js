const jwt = require("jsonwebtoken");
require("dotenv").config("api/.env");

// verifies token is valid
cookieJwtAuth = (req, res, next) => {
  const token = req.cookies.token;
  try {
    const user = jwt.verify(token, process.env.MY_SECRET);
    req.user = user;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.status(401).send({ message: "Unauthorized. Please log in." });
  }
};

module.exports = { cookieJwtAuth };