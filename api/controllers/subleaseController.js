const pool = require("../src/db.js");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config("api/.env");

const createSubleaseController = async (req, res) =>{
    try{
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
            description} = req.body;
        if(street_name==''||city==''||postal_code==''||listerID==null||price==''||gender==''||roomCount==''||bathroomCount==''||startTerm==''||endTerm==''){
            return res.status(400).json({message:"Params are incomeplete"});
        }
        //need to add subleaseID,longitud/latitude, and photos somehow
        const subleaseID = uuidv4();

        //get log/lat
        const address = street_name+" "+city+" California "+postal_code;
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=1`);
        const val = await resp.json();

        //check if address exists
        if(val.length==0){
            return res.status(400).json({message:'Address does not exist'});
        }

        const lat = val[0].lat;
        const lon = val[0].lon;
        console.log(listerID);
    const insertQuery={
        text:`INSERT INTO sublease(
        listerID,
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
        longitude
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        values: [listerID, price, gender, roomCount, bathroomCount, street_name, room, postal_code, startTerm, endTerm, description, subleaseID, lat, lon]
        }
        const response  = await pool.query(insertQuery);
        console.log(response);
        return res.status(200).json({message:"Successfully created listing", success:true});
    }catch(err){
        return res.status(500).json({message:err})
    }
}

const getSubleasesController= async (req,res)=>{
    console.log('Hello')
    const query="SELECT subleaseID, latitude, longitude FROM sublease";
    const response = await pool.query(query);
    console.log(response);

    return res.status(200).json(response.rows);
}
module.exports = { createSubleaseController, getSubleasesController};