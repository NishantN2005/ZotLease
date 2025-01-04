//define environment code is running in
const ENVIRONMENT = import.meta.env.VITE_ENV

export const API_URL = ENVIRONMENT === 'dev' ? 'http://localhost:5555' : 'http://zotlease-api.service.local' 

export const PHOTO_BUCKET = `zotlease-${ENVIRONMENT}-photoupload`;
