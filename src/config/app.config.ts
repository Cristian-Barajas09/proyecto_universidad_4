export const appConfig = () => ({
  databaseURI: process.env.DATABASE_URI || 'mongodb://localhost:27017/myapp',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
});
