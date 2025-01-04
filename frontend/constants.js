//define environment code is running in
const ENVIRONMENT = import.meta.env.VITE_ENV

export const API_URL = import.meta.env.VITE_API_URL

export const PHOTO_BUCKET = `zotlease-${ENVIRONMENT}-photoupload`;

export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN