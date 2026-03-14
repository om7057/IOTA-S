import dotenv from 'dotenv';

dotenv.config();

const environment = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  API_URL: process.env.API_URL || 'http://localhost:3000',

  // Database
  DB: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'iota_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      max: parseInt(process.env.DB_POOL_MAX || '5'),
      acquire: 30000,
      idle: 10000,
    },
  },

  // JWT
  JWT: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || '7d',
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '30d',
  },

  // Google OAuth
  GOOGLE: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrlWeb: process.env.GOOGLE_CALLBACK_URL_WEB || 'http://localhost:3000/api/auth/google/callback',
    callbackUrlMobile: process.env.GOOGLE_CALLBACK_URL_MOBILE || 'myapp://auth/callback',
  },

  // CORS
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(','),

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // Email
  SMTP: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
  },

  // External Services
  EXTERNAL: {
    newsfetcherUrl: process.env.NEWSFETCHER_URL || 'http://localhost:8000',
    analyticsUrl: process.env.ANALYTICS_URL || 'http://localhost:9000',
  },

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',

  // Helpers
  isDevelopment: () => environment.NODE_ENV === 'development',
  isProduction: () => environment.NODE_ENV === 'production',
  isTest: () => environment.NODE_ENV === 'test',
};

export default environment;
