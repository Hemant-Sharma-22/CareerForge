const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'careerforge_jwt_fallback_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  groqApiKey: process.env.GROQ_API_KEY || '',
  fast2smsApiKey: process.env.FAST2SMS_API_KEY || '',
  adzunaAppId: process.env.ADZUNA_APP_ID || '',
  adzunaAppKey: process.env.ADZUNA_APP_KEY || '',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/careerforge?schema=public'
};
