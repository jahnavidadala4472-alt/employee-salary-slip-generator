require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/payroll_db',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_payroll_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gemini-1.5-flash',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5000',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
