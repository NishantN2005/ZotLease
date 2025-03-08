const jwt = require("jsonwebtoken");
require("dotenv").config("api/.env");

// verifies if token is valid
const cookieJwtAuth = (req, res, next) => {
  const token = req.cookies.accesstoken; // Get the token from cookies

  if (!token) {
    return res.status(401).send({ message: "Unauthorized. Please log in." });
  }

  try {
    // Verify the token
    const user = jwt.verify(token, process.env.MY_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send({ message: "Unauthorized. Please log in." });
  }
};

module.exports = { cookieJwtAuth };
