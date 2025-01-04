//define environment code is running in
const ENVIRONMENT = import.meta.env.VITE_ENV== "beta"?"beta":"dev";

export const API_URL = import.meta.env.VITE_API_URL

export const PHOTO_BUCKET = `zotlease-${ENVIRONMENT}-photoupload`;
