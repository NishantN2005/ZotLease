const ENVIRONMENT = process.env.ENV== "beta"?"beta":"dev";

const ORIGIN = ENVIRONMENT=="dev"?"http://localhost:5173":"";
const IP = ENVIRONMENT=="dev"?"0.0.0.0":'';
const PORT = ENVIRONMENT=="dev"?"5555":'';

module.exports={ORIGIN,IP,PORT, ENVIRONMENT};
