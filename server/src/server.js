const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../docs/swagger.json');

const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Auto Copy Screenshots helper
const copyScreenshots = () => {
  try {
    const srcDir = 'C:\\Users\\91724\\.gemini\\antigravity\\brain\\52200230-37bc-4163-bb01-2ffcd3c2647c';
    const destDir = path.join(__dirname, '../../screenshots');
    if (fs.existsSync(srcDir) && !fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    if (fs.existsSync(srcDir) && fs.existsSync(destDir)) {
      const files = fs.readdirSync(srcDir);
      files.forEach(file => {
        let destName = null;
        if (file.includes('dashboard_preview')) destName = 'dashboard_preview.jpg';
        if (file.includes('ats_analysis_preview')) destName = 'ats_analysis_preview.jpg';
        if (file.includes('job_discovery_preview')) destName = 'job_discovery_preview.jpg';
        if (destName) {
          fs.copyFileSync(path.join(srcDir, file), path.join(destDir, destName));
        }
      });
    }
  } catch (e) {
    // Ignore copy errors silently
  }
};
copyScreenshots();

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jdRoutes = require('./routes/jdRoutes');
const atsRoutes = require('./routes/atsRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Security & Core Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Uploads Serving
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
app.use('/screenshots', express.static(path.join(__dirname, '../../screenshots')));

// Swagger API Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'CareerForge API Gateway',
    timestamp: new Date(),
    groqConfigured: Boolean(config.groqApiKey && config.groqApiKey !== 'gsk_your_groq_api_key_here')
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/job-descriptions', jdRoutes);
app.use('/api/analysis', atsRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Production Static Client Build Serving (Render / Cloud Deployment)
const clientBuildPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
}

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = config.port;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 CareerForge Server running on http://localhost:${PORT}`);
    console.log(`📖 API Documentation available at http://localhost:${PORT}/api-docs`);
    console.log(`====================================================`);
  });
}

module.exports = app;
