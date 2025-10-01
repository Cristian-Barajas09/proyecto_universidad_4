export const appConfig = () => ({
  databaseURI: process.env.DATABASE_URI || 'mongodb://localhost:27017/myapp',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
  zoomClientId: process.env.ZOOM_CLIENT_ID || 'default_zoom_client_id',
  zoomClientSecret:
    process.env.ZOOM_CLIENT_SECRET || 'default_zoom_client_secret',
  zoomAccountId: process.env.ZOOM_ACCOUNT_ID || 'default_zoom_account_id',
  zoomURL: process.env.ZOOM_URL || 'https://api.zoom.us/v2',
});
