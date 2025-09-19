import { config } from 'dotenv';

// Load environment variables
config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: process.env.HOST || 'localhost',

  // Database
  MONGODB_URI:
    process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-db',

  // JWT
  JWT_SECRET:
    process.env.JWT_SECRET ||
    'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // API
  API_PREFIX: process.env.API_PREFIX || '/api',

  // CORS
  CORS_ORIGIN:
    process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:4200,http://localhost:4201',
};

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
