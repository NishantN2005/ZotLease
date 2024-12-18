const pool = require("../src/db.js");
const jwt = require("jsonwebtoken");
require("dotenv").config("api/.env");

const loginController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .send({ message: "Send all required fields: email, password" });
  }

  const userQuery = {
    text: "SELECT * FROM users WHERE email = $1",
    values: [email],
  };

  const queryRes = await pool.query(userQuery);
  if (!queryRes) return res.status(404).send({ message: "user not found" });

  const user = queryRes.rows[0];

  // check password match
  if (user.password !== password) {
    return res.status(403).send({ message: "invalid login" });
  }

  delete user.password;

  // creates json web token that expires in 1 hr
  const token = jwt.sign(user, process.env.MY_SECRET, { expiresIn: "1s" });

  // stores jwt as a cookie for security
  res.cookie("token", token, {
    httpOnly: true,
  });

  return res.status(200).send({
    message: "Login Successful!",
  });
};

module.exports = { loginController };
