const ENVIRONMENT = process.env.ENV== "beta"?"beta":"dev";

const ORIGIN = ENVIRONMENT=="dev"?"http://localhost:5173":"";
const PORT = 5555;
const IP = '0.0.0.0';


module.exports={ORIGIN,IP,PORT, ENVIRONMENT};
