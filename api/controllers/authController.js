const pool = require("../src/db.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config("api/.env");
const { ORIGIN, IP, PORT, ENVIRONMENT } = require("../constants.js");

console.log("AUTH ORIGIN", ORIGIN);

const isProd = ORIGIN === "https://www.zotlease.org";

const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "Lax",
  domain: isProd ? ".zotlease.org" : "localhost",
  path: "/",
  maxAge: 24 * 60 * 60,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "Lax",
  domain: isProd ? ".zotlease.org" : "localhost",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
};

async function hashPassword(plainTextPassword) {
  // The saltRounds parameter controls how much time is needed to calculate a single hash.
  // Higher means more secure but slower. 10 is a reasonable default.
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
  return hashedPassword;
}
async function verifyPassword(plainTextPassword, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
    return isMatch; // true if passwords match, false otherwise
  } catch (error) {
    console.error("Error verifying password:", error);
    throw error;
  }
}

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

  if (!user) return res.status(400).send({ message: "user not found" });

  // check password match
  if (!(await verifyPassword(password, user.password))) {
    console.log("Invalid password");
    return res.status(403).send({ message: "invalid login" });
  }

  delete user.password;

  // creates json web token that allows access to api
  const accessToken = jwt.sign(user, process.env.MY_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(
    { email: user.email, jti: uuidv4() },
    process.env.MY_SECRET,
    {
      expiresIn: "8h",
    }
  );

  // stores jwt as a cookie for security
  res.cookie("token", refreshToken, refreshCookieOptions);

  // stores access jwt as a cookie for security
  res.cookie("accesstoken", accessToken, accessCookieOptions);

  return res.status(200).send({ message: "Logged in!" });
};

const googleAuthController = async (email, fname, lname, res) => {
  const checkUserQuery = `SELECT * FROM users WHERE email = $1`;
  const checkUserValues = [email];
  const checkUserRes = await pool.query(checkUserQuery, checkUserValues);

  let userid;
  if (!lname) lname = "";

  if (checkUserRes.rowCount === 0) {
    userid = uuidv4();
    const defaultPassword = uuidv4();
    const insertUserQuery = `INSERT INTO users (userID, email, fname, lname, password) VALUES ($1, $2, $3, $4, $5)`;
    const insertUserValues = [userid, email, fname, lname, defaultPassword];
    await pool.query(insertUserQuery, insertUserValues);
  } else {
    console.log(checkUserRes.rows[0]);
    userid = checkUserRes.rows[0].userid;
  }

  const user = {
    fname: fname,
    lname: lname,
    email: email,
    userid: userid,
  };

  console.log("IN GOOGLE TOKEN");

  const accessToken = jwt.sign(user, process.env.MY_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(
    { email: email, jti: uuidv4() },
    process.env.MY_SECRET,
    {
      expiresIn: "8h",
    }
  );

  // stores jwt as a cookie for security
  res.cookie("token", refreshToken, refreshCookieOptions);

  // stores access jwt as a cookie for security
  res.cookie("accesstoken", accessToken, accessCookieOptions);

  return { accessToken, id: userid };
};

const refreshController = async (req, res) => {
  if (req.cookies?.token) {
    const refreshToken = req.cookies.token;
    const decoded = jwt.decode(refreshToken);

    console.log(refreshToken.jti);
    console.log("jti here", decoded.jti);
    const query = {
      text: `SELECT 1 FROM refresh_token_blacklist WHERE token_id = $1`,
      values: [decoded.jti],
    };
    const resp = await pool.query(query);

    console.log(resp);
    if (resp.rowCount == 1) {
      return res.status(401).json({ message: "Token is blacklisted" });
    }
    jwt.verify(refreshToken, process.env.MY_SECRET, (err, decoded) => {
      if (err) {
        res.clearCookie("token");
        return res.status(406).json({ message: "Unauthorized" });
      }

      const accessToken = jwt.sign(
        { id: decoded.userID },
        process.env.MY_SECRET,
        {
          expiresIn: "1h",
        }
      );

      return res.json({ accessToken, id: decoded.userID });
    });
  } else {
    return res.status(401).json({ message: "No refresh token provided" });
  }
};

const signupController = async (req, res) => {
  try {
    const { fname, lname, email, password } = req.body;
    console.log(fname, lname, email, password);
    if (!fname || !lname || !email || !password) {
      console.log("Something was not defined");
      return res
        .status(400)
        .send({ message: "Make sure all fields are filled out" });
    }
    //generate unique identification for user
    const userID = uuidv4();
    console.log(`New user generated userID is: ${userID}`);

    //Hash password and delete og
    const hashedPassword = await hashPassword(password);
    delete password;

    //generate text query to insert new user into Postgresql database
    const insertQuery = {
      text: "INSERT INTO users(fname,lname,email,password,userID) VALUES ($1,$2,$3,$4,$5)",
      values: [fname, lname, email, hashedPassword, userID],
    };

    const response = pool.query(insertQuery);
    console.log(response);

    //Create token
    const user = {
      fname: fname,
      lname: lname,
      email: email,
      userid: userID,
    };

    // creates json web token that allows access to api
    const accessToken = jwt.sign(user, process.env.MY_SECRET, {
      expiresIn: "1h",
    });

    // creates json web token that expires in 1 hr
    const refreshToken = jwt.sign(
      {
        email: user.email,
        jti: uuidv4(),
      },
      process.env.MY_SECRET,
      {
        expiresIn: "8h",
      }
    );

    // stores jwt as a cookie for security
    res.cookie("token", refreshToken, refreshCookieOptions);

    // stores access jwt as a cookie for security
    res.cookie("accesstoken", accessToken, accessCookieOptions);

    return res.status(200).send({
      message: "Successfully created user profile",
    });
  } catch (err) {
    // TODO: need to check if they tried to signup after already having an account
    console.log(err);
    return res.status(500).send({ message: "Failed to insert new user" });
  }
};

const logoutController = async (req, res) => {
  console.log("inside logout");
  console.log(req.cookies.token);

  if (req.cookies?.token) {
    const refreshToken = req.cookies.token;
    console.log("refresh here", refreshToken);
    const decoded = jwt.decode(refreshToken);

    console.log("expiration is here", decoded.exp);
    console.log(decoded.jti);

    const drop = {
      text: `SELECT * FROM chatRooms`,
    };
    const dRes = await pool.query(drop);
    console.log(dRes);

    //add token to blacklist
    const addToBlacklist = {
      text: "INSERT INTO refresh_token_blacklist(token_id, expiry) VALUES ($1, TO_TIMESTAMP($2))",
      values: [decoded.jti, decoded.exp],
    };

    const response = await pool.query(addToBlacklist);
    console.log(response);

    res.clearCookie("token");
    res.clearCookie("accesstoken");
    return res.status(200).send({
      message: "Successfully added token to blacklist",
      success: true,
    });
  }
  return res
    .status(400)
    .send({ message: "Refresh token was already cleared", success: false });
};

const decoderController = (req, res) => {
  console.log("inside decoder", req.cookies);
  const token = req.cookies.accesstoken;
  console.log("token here", token);

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }
  try {
    const decoded = jwt.verify(token, process.env.MY_SECRET);
    return res.status(200).json({ decoded, token });
  } catch (ex) {
    res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = {
  loginController,
  signupController,
  refreshController,
  logoutController,
  googleAuthController,
  decoderController,
};
