const ENVIRONMENT = process.env.ENV

const ORIGIN = ENVIRONMENT=="dev"?"http://localhost:5173":"";
const PORT = 5555;
const IP = '0.0.0.0';


module.exports={ORIGIN,IP,PORT, ENVIRONMENT};
