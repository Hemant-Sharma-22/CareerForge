const { PrismaClient } = require('@prisma/client');
const config = require('./index');

let prisma;

try {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: config.databaseUrl
      }
    }
  });
} catch (error) {
  console.warn('PrismaClient instantiation warning:', error.message);
}

// In-Memory Storage Fallback for seamless execution without active DB setup
const inMemoryStore = {
  users: [],
  user_profiles: [],
  resumes: [],
  resume_versions: [],
  job_descriptions: [],
  ats_analyses: [],
  job_listings: [],
  saved_jobs: [],
  job_applications: [],
  otps: []
};

module.exports = {
  prisma,
  inMemoryStore
};
