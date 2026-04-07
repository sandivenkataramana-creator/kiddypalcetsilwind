require('dotenv').config();

module.exports = {
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  PORT: process.env.PORT || 5000,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || 'your_admin_jwt_secret',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
