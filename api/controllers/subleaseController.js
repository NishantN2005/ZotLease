const pool = require("../src/db.js");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config("api/.env");

const createSubleaseController = async (req, res) =>{
    const {
        street_name,
        room,
        city,
        state,
        country,
        postal_code, 
        listerID, 
        price, 
        gender, 
        roomCount, 
        bathroomCount, 
        startTerm, 
        endTerm,
        description} = req.body;
    if(street_name==''||state==''||country==''||postal_code==''||listerID==null||price==''||gender==''||roomCount==''||bathroomCount==''||startTerm==''||endTerm==''){
        return res.status(400).json({message:"Params are incomeplete"});
    }
    //need to add subleaseID,longitud/latitude, and photos somehow
    console.log(street_name, state, country, postal_code, listerID, price, gender, roomCount, bathroomCount, startTerm, endTerm, description )
    const subleaseID = uuidv4();

    //get log/lat
    const address = street_name+" "+city+" "+state+" "+postal_code;
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const val = await resp.json();
    const lat = val[0].lat;
    const lon = val[0].lon;
    console.log(val);

    /*const insertSublease = {
        text:`INSERT INTO sublease 
        (listerID, 
        price, 
        gender, 
        roomCount, 
        bathroomCount, 
        street_name,
        room, 
        postal_code, 
        startTerm, 
        endTerm, 
        description, 
        subleaseID, 
        latitude, 
        longitude) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);`,
        values:[listerID, price, gender, roomCount, bathroomCount, street_name,room, state, country, postal_code, startTerm, endTerm, description, subleaseID, lat, lon]
    }*/
   const createTable=`
    CREATE TABLE sublease (
        id SERIAL PRIMARY KEY,
        listerID TEXT NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        gender TEXT NOT NULL,
        roomCount INT NOT NULL,
        bathroomCount INT NOT NULL,
        street_name TEXT NOT NULL,
        room TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        startTerm TEXT NOT NULL,
        endTerm TEXT NOT NULL,
        description TEXT NOT NULL,
        subleaseID TEXT NOT NULL,
        latitude DOUBLE PRECISION CHECK (latitude BETWEEN -90 AND 90),
        longitude DOUBLE PRECISION CHECK (longitude BETWEEN -180 AND 180)
        );`
   
    const response  = await pool.query(dropTable);
    console.log(response);
    return res.status(200).json({message:"Successfully created listing"});
}
module.exports = { createSubleaseController};