const ENVIRONMENT = process.env.ENV

let ORIGIN = process.env.ORIGIN
//get rid of trailing slashes
if (ORIGIN.endsWith('/')) {
    ORIGIN = ORIGIN.replace(/\/+$/, '');
  }
const PORT = 5555;
const IP = '0.0.0.0';

let API_URL;
if(ORIGIN=='beta'){
  API_URL = 'https://api.zotlease.com';
}else{
  API_URL = 'http://localhost:5555';
}
const SSL_PATH = process.env.SSL_PATH;
const COUNTRYMAP = {
  'United States': 'US',
  'Canada': 'CA',
  'Mexico': 'MX',
  'India': 'IN',
  'China': 'CN',
  'United Kingdom': 'GB',
  'Australia': 'AU',
  'Germany': 'DE',
  'France': 'FR',
  'Japan': 'JP',
  'South Korea': 'KR',
  'Brazil': 'BR',
  'Russia': 'RU',
  'Italy': 'IT',
  'Spain': 'ES',
  'Netherlands': 'NL',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Finland': 'FI',
  'Denmark': 'DK',
  'Poland': 'PL',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Belgium': 'BE',
  'Portugal': 'PT',
  'Ireland': 'IE',
  'New Zealand': 'NZ',
  'Singapore': 'SG',
  'Malaysia': 'MY',
  'Thailand': 'TH',
  'Indonesia': 'ID',
  'Philippines': 'PH',
  'Vietnam': 'VN',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Peru': 'PE',
  'Egypt': 'EG',
  'South Africa': 'ZA',
  'Nigeria': 'NG',
  'Kenya': 'KE',
  'Ghana': 'GH'
};

SES_FROM_EMAIL = 'zotlease@gmail.com'

module.exports={ORIGIN,IP,PORT, ENVIRONMENT, SSL_PATH, COUNTRYMAP, SES_FROM_EMAIL};
