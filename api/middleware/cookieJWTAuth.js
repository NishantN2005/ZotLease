const jwt = require("jsonwebtoken");
require("dotenv").config("api/.env");

// verifies access token is valid
cookieJwtAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Unauthorized. Please log in." });
  }
  const token = authHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, process.env.MY_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send({ message: "Unauthorized. Please log in." });
  }
};

module.exports = { cookieJwtAuth };
