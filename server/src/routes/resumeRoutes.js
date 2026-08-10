const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  uploadResume,
  getResumes,
  getResumeById,
  setDefaultResume,
  deleteResume,
  createVersion,
  compareVersions
} = require('../controllers/resumeController');

router.post('/upload', authenticateToken, upload.single('resume'), uploadResume);
router.get('/', authenticateToken, getResumes);
router.get('/:id', authenticateToken, getResumeById);
router.patch('/:id/default', authenticateToken, setDefaultResume);
router.delete('/:id', authenticateToken, deleteResume);
router.post('/:id/versions', authenticateToken, createVersion);
router.get('/:id/versions/compare', authenticateToken, compareVersions);

module.exports = router;
