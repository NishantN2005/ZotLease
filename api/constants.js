const ENVIRONMENT = process.env.ENV

let ORIGIN = process.env.ORIGIN
//get rid of trailing slashes
if (ORIGIN.endsWith('/')) {
    ORIGIN = ORIGIN.replace(/\/+$/, '');
  }
const PORT = 5555;
const IP = '0.0.0.0';

const SSL_PATH = process.env.SSL_PATH;

module.exports={ORIGIN,IP,PORT, ENVIRONMENT, SSL_PATH};
