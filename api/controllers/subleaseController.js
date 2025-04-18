const pool = require("../src/db.js");
const { COUNTRYMAP } = require("../constants.js");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config("api/.env");

const createSubleaseController = async (req, res) => {
  try {
    const {
      street_name,
      room,
      city,
      postal_code,
      state,
      country,
      listerID,
      price,
      gender,
      roomCount,
      bathroomCount,
      startTerm,
      endTerm,
      description,
      insta,
    } = req.body;
    if (
      street_name == "" ||
      city == "" ||
      postal_code == "" ||
      state == "" ||
      country == "" ||
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
    let iso2Country = COUNTRYMAP[country] || "US";
    //get log/lat
    const resp = await fetch(`
      https://api.mapbox.com/search/geocode/v6/forward?address_line1=${street_name}&place=${city}&region=${state}&postcode=${postal_code}&country=${iso2Country}&limit=1&permanent=true&access_token=${process.env.MAPBOX_KEY}`);
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
    } else {
      subleaseID = uuidv4();
    }
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
        state,
        country,
        startTerm,
        endTerm,
        description,
        subleaseID,
        latitude,
        longitude,
        insta
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
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
        state,
        country,
        startTerm,
        endTerm,
        description,
        subleaseID,
        lat,
        lon,
        insta,
      ],
    };
    const response = await pool.query(insertQuery);
    return res.status(200).json({
      subleaseid: subleaseID,
      longitude: lon,
      latitude: lat,
      listerid: listerID,
      price: price,
      street_name: street_name,
      city: city,
      state: state,
      country: country,
      postal_code: postal_code,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const getSubleasesController = async (req, res) => {
  const { swLat, swLng, neLat, neLng } = req.body;
  const query =
    "SELECT id, subleaseID, listerID, latitude, longitude, price, street_name, city, postal_code, gender, roomCount, bathRoomCount, viewcount FROM sublease";
  const new_query_string =
    "SELECT id, subleaseID, listerID, latitude, longitude, price, street_name, city, postal_code, gender, roomCount, bathRoomCount, viewcount\
  FROM sublease\
  WHERE latitude BETWEEN $1 AND $2\
  AND longitude BETWEEN $3 AND $4;";

  const new_query = {
    text: new_query_string,
    values: [swLat, neLat, swLng, neLng],
  };
  const response = await pool.query(new_query);
  return res.status(200).json(response.rows);
};

const getSubleaseInfoController = async (req, res) => {
  const { subleaseID, uniqueid, userid } = req.body;
  // user id is the id of the person who clicked it

  const query = {
    text: `SELECT 
    s.*,           
    u.fname,  
    u.lname,
    u.email 
    FROM sublease s
    JOIN users u 
        ON s.listerID = u.userID
    WHERE s.subleaseid = $1;`,
    values: [subleaseID],
  };
  try {
    const response = await pool.query(query);
    // we need to increment view count by 1 now that it has been view
    const updateviewcount = {
      text: `UPDATE sublease SET viewcount = viewcount + 1 WHERE id = $1 AND listerid <> $2;`,
      values: [uniqueid, userid],
    };
    const incrementCount = await pool.query(updateviewcount);

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

  const response = await pool.query(query);

  let acceptedSubleases = [];
  for (sublease of response.rows) {
    acceptedSubleases.push(sublease.subleaseid);
  }
  res.status(200).json({ parsedSubleases: acceptedSubleases });
};

const editSubleaseController = async (req, res) => {
  const {
    price,
    gender,
    street_name,
    room,
    roomcount,
    bathroomcount,
    city,
    postal_code,
    state,
    country,
    startterm,
    endterm,
    description,
    subleaseid,
    latitude,
    longitude,
    listerid,
    insta,
  } = req.body;
  try {
    const editQuery = {
      text: `UPDATE sublease SET 
        price = $1,
        gender = $2,
        roomCount = $3,
        bathroomCount = $4,
        street_name = $5,
        city = $6,
        room = $7,
        postal_code = $8,
        state = $9,
        country = $10,
        startTerm = $11,
        endTerm = $12,
        description = $13,
        latitude = $14,
        longitude = $15,
        insta = $16
        WHERE subleaseid = $17 
        RETURNING *`,
      values: [
        price,
        gender,
        roomcount,
        bathroomcount,
        street_name,
        city,
        room,
        postal_code,
        state,
        country,
        startterm,
        endterm,
        description,
        latitude,
        longitude,
        insta,
        subleaseid,
      ],
    };
    const response = await pool.query(editQuery);
    res.status(200).json(response.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating sublease" });
  }
};

const deleteSubleaseController = async (req, res) => {
  const { id } = req.body;
  const query = {
    text: `DELETE FROM sublease WHERE id = $1`,
    values: [id],
  };
  const response = await pool.query(query);
  res.status(200).json({ message: "Sublease deleted" });
};

const getSubleaseFromController = async (req, res) => {
  const { listerid } = req.body;
  const query = {
    text: `SELECT * FROM sublease WHERE listerid = $1`,
    values: [listerid],
  };
  const response = await pool.query(query);
  res.status(200).json(response.rows);
};

const getLandingLocationsController = async (req, res) => {
  const query = {
    text: `SELECT latitude, longitude, price FROM sublease`,
  };
  const response = await pool.query(query);
  res.status(200).json(response.rows);
};

const getSubleasesListController = async (req, res) => {
  // Extract limit and offset from query parameters; default limit to 30 and offset to 0
  const limit = parseInt(req.query.limit, 10) || 15;
  const offset = parseInt(req.query.offset, 10) || 0;

  // Construct the SQL query. Ordering by id descending (newest first) is typical,
  // but you can change the ORDER BY clause as needed.
  const query = `
    SELECT id, subleaseID, listerID, latitude, longitude, price, street_name, city, postal_code, gender, roomCount, bathRoomCount, viewcount
    FROM sublease
    ORDER BY id DESC
    LIMIT $1 OFFSET $2;
  `;

  try {
    const result = await pool.query(query, [limit, offset]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error retrieving paginated subleases:", error);
    return res.status(500).json({ error: "Database error" });
  }
};

module.exports = {
  createSubleaseController,
  getSubleasesController,
  getSubleaseInfoController,
  getSubleaseFilterController,
  deleteSubleaseController,
  getSubleaseFromController,
  getLandingLocationsController,
  editSubleaseController,
  getSubleasesListController,
};
