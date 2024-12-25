const pool = require("../src/db.js");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config("api/.env");

const createSubleaseController = async (req, res) => {
  try {
    console.log('inside api func tp create')
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
    //need to add subleaseID,longitud/latitude, and photos somehow
    const subleaseID = uuidv4();

    //get log/lat
    const resp = await fetch(`
            https://api.mapbox.com/search/geocode/v6/forward?address_line1=${street_name}&place=${city}&region=California&postcode=${postal_code}&limit=1&permanent=true&access_token=${process.env.MAPBOX_KEY}`);
    const val = await resp.json();
    const coordinates = val.features[0].geometry.coordinates;
    //check if address exists
    if (val.length == 0) {
      return res.status(400).json({ message: "Address does not exist" });
    }

    const lat = coordinates[1];
    const lon = coordinates[0];
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
    const response = await pool.query(insertQuery);
    console.log(response);
    return res
      .status(200)
      .json({ message: "Successfully created listing", success: true });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const getSubleasesController = async (req, res) => {
  console.log("Hello");
  const query =
    "SELECT subleaseID, listerID, latitude, longitude FROM sublease";
  const response = await pool.query(query);

  return res.status(200).json(response.rows);
};

const getSubleaseInfoController = async(req, res)=>{
  const {subleaseID} = req.body;

  const query={
    text:`SELECT 
    s.*,           
    u.fname,  
    u.lname    
    FROM sublease s
    JOIN users u 
        ON s.listerID = u.userID
    WHERE s.subleaseid = $1;`,
    values: [subleaseID]
  }
  try{
    const response = await pool.query(query);
    console.log(response)
    return res.status(200).json(response.rows[0]);

  }catch(err){
    console.log(`Error trying to fetch sublease data: ${err}`);
  }

};
module.exports = { createSubleaseController, getSubleasesController, getSubleaseInfoController };
