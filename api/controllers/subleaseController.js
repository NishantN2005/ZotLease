const pool = require("../src/db.js");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config("api/.env");

const createSubleaseController = async (req, res) => {
  try {
    console.log("inside api func tp create");
    const {
      street_name,
      room,
      city,
      postal_code,
      listerID,
      price,
      gender,
      roomCount,
      bathroomCount,
      startTerm,
      endTerm,
      description,
    } = req.body;
    if (
      street_name == "" ||
      city == "" ||
      postal_code == "" ||
      listerID == null ||
      price == "" ||
      gender == "" ||
      roomCount == "" ||
      bathroomCount == "" ||
      startTerm == "" ||
      endTerm == ""
    ) {
      return res.status(400).json({ message: "Params are incomeplete" });
    }
    /**
     * Check if address exists, if it does, get the subleaseID
     * using lat/lon so no need to santize the address
     */
    let coordinates;
    //get log/lat
    const resp = await fetch(`
      https://api.mapbox.com/search/geocode/v6/forward?address_line1=${street_name}&place=${city}&region=California&postcode=${postal_code}&limit=1&permanent=true&access_token=${process.env.MAPBOX_KEY}`);
    const val = await resp.json();
    //check if address exists
    if (val.length == 0) {
      return res.status(400).json({ message: "Address does not exist" });
    }

    coordinates = val.features[0].geometry.coordinates;
    const lat = coordinates[1];
    const lon = coordinates[0];

    const checkIfExistsQuery = {
      text: `SELECT * FROM sublease WHERE longitude=$1 AND latitude=$2`,
      values: [lon, lat],
    };
    const responseOnExists = await pool.query(checkIfExistsQuery);
    let subleaseID;
    if (responseOnExists.rows.length > 0) {
      console.log("Address already exists");
      subleaseID = responseOnExists.rows[0].subleaseid;
      console.log("subleaseID", subleaseID);
    } else {
      subleaseID = uuidv4();
    }
    console.log(listerID);
    const insertQuery = {
      text: `INSERT INTO sublease(
        listerID,
        price,
        gender,
        roomCount,
        bathroomCount,
        street_name,
        city,
        room,
        postal_code,
        startTerm,
        endTerm,
        description,
        subleaseID,
        latitude,
        longitude
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, $15)`,
      values: [
        listerID,
        price,
        gender,
        roomCount,
        bathroomCount,
        street_name,
        city,
        room,
        postal_code,
        startTerm,
        endTerm,
        description,
        subleaseID,
        lat,
        lon,
      ],
    };
    console.log("about to make query");
    console.log(insertQuery);
    const response = await pool.query(insertQuery);
    console.log(response);
    return res.status(200).json({
      subleaseid: subleaseID,
      longitude: lon,
      latitude: lat,
      listerid: listerID,
      price: price,
      street_name: street_name,
      city: city,
      postal_code: postal_code,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const getSubleasesController = async (req, res) => {
  console.log("Hello");
  const query =
    "SELECT id, subleaseID, listerID, latitude, longitude, price, street_name, city, postal_code, gender, roomCount, bathRoomCount FROM sublease";
  const response = await pool.query(query);

  return res.status(200).json(response.rows);
};

const getSubleaseInfoController = async (req, res) => {
  const { subleaseID, uniqueid, userid } = req.body;
  // user id is the id of the person who clicked it

  const query = {
    text: `SELECT 
    s.*,           
    u.fname,  
    u.lname    
    FROM sublease s
    JOIN users u 
        ON s.listerID = u.userID
    WHERE s.subleaseid = $1;`,
    values: [subleaseID],
  };
  try {
    const response = await pool.query(query);
    console.log(response);

    // we need to increment view count by 1 now that it has been view
    const updateviewcount = {
      text: `UPDATE sublease SET viewcount = viewcount + 1 WHERE id = $1 AND listerid <> $2;`,
      values: [uniqueid, userid],
    };
    const incrementCount = await pool.query(updateviewcount);
    console.log("Incremented viewcount");
    console.log(incrementCount);

    return res.status(200).json(response.rows);
  } catch (err) {
    console.log(`Error trying to fetch sublease data: ${err}`);
  }
};

const getSubleaseFilterController = async (req, res) => {
  let { gender, minPrice, maxPrice, roomCount, startdate, enddate } = req.body;
  if (minPrice == null) {
    minPrice = 0;
  }
  if (maxPrice == null) {
    maxPrice = 1000000;
  }
  if (roomCount == "") {
    roomCount = null;
  }
  if (startdate == null) {
    startdate = "2020-5-1"; //just put a date from long ago so it include every start date
  }
  if (enddate == null) {
    enddate = "2100-12-31"; //put end date for super far in future if not defined
  }
  var query = {
    text: "SELECT subleaseid FROM sublease WHERE price BETWEEN $1 AND $2 AND TO_DATE(startterm, 'YYYY-MM-DD') >= $3::date AND TO_DATE(endterm, 'YYYY-MM-DD') <= $4::date",
    values: [minPrice, maxPrice, startdate, enddate],
  };
  if (gender != "") {
    query.text += ` AND gender=$${query.values.length + 1}`;
    query.values.push(gender);
  }
  if (roomCount !== null) {
    query.text += ` AND roomcount = $${query.values.length + 1}`;
    query.values.push(roomCount);
  }
  console.log("FILTER QUERY IS HERE");
  console.log(query);
  //if both gender and roomcount were selected
  let filterQuery;
  if (gender !== "" && roomCount !== null) {
    filterQuery = {
      text: `SELECT subleaseid FROM sublease WHERE gender=$1 AND price BETWEEN $2 AND $3 AND roomcount = $4`,
      values: [gender, minPrice, maxPrice, roomCount],
    };
  } else if (roomCount !== null) {
    //if gender is any
    filterQuery = {
      text: `SELECT subleaseid FROM sublease WHERE price BETWEEN $1 AND $2 AND roomcount = $3`,
      values: [minPrice, maxPrice, roomCount],
    };
  } else if (gender !== "") {
    //roomCount is any
    filterQuery = {
      text: `SELECT subleaseid From sublease WHERE gender=$1 AND price BETWEEN $2 AND $3`,
      values: [gender, minPrice, maxPrice],
    };
  } else if (gender === "" && roomCount === null) {
    filterQuery = {
      text: `SELECT subleaseid FROM sublease WHERE price BETWEEN $1 AND $2`,
      values: [minPrice, maxPrice],
    };
  }
  console.log("filter query here", filterQuery);

  const response = await pool.query(query);

  console.log(response);
  let acceptedSubleases = [];
  for (sublease of response.rows) {
    acceptedSubleases.push(sublease.subleaseid);
  }
  console.log(acceptedSubleases);
  res.status(200).json({ parsedSubleases: acceptedSubleases });
};

const deleteSubleaseController = async (req, res) => {
  const { id } = req.body;
  const query = {
    text: `DELETE FROM sublease WHERE id = $1`,
    values: [id],
  };
  const response = await pool.query(query);
  console.log(response);
  res.status(200).json({ message: "Sublease deleted" });
};

const getSubleaseFromController = async (req, res) => {
  const { listerid } = req.body;
  console.log(listerid);
  const query = {
    text: `SELECT * FROM sublease WHERE listerid = $1`,
    values: [listerid],
  };
  const response = await pool.query(query);
  console.log(response);
  res.status(200).json(response.rows);
};

module.exports = {
  createSubleaseController,
  getSubleasesController,
  getSubleaseInfoController,
  getSubleaseFilterController,
  deleteSubleaseController,
  getSubleaseFromController,
};
