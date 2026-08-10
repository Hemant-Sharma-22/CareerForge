const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  runAnalysis,
  getAnalysisById,
  getAnalysisHistory,
  improveBulletPoint,
  generateOptimizedResumeController
} = require('../controllers/atsController');

router.post('/', authenticateToken, runAnalysis);
router.get('/history', authenticateToken, getAnalysisHistory);
router.get('/:id', authenticateToken, getAnalysisById);
router.post('/improve-bullet', authenticateToken, improveBulletPoint);
router.post('/generate-resume', authenticateToken, generateOptimizedResumeController);

module.exports = router;
