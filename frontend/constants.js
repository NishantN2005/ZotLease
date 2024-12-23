//define environment code is running in
const ENVIRONMENT = import.meta.env.VITE_ENV== "beta"?"beta":"dev";

export const API_URL = ENVIRONMENT=="beta"? 'https://beta.zotlease.com':'http://localhost:5555';

