const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  createJobDescription,
  getJobDescriptions,
  getJobDescriptionById
} = require('../controllers/jdController');

router.post('/', authenticateToken, upload.single('jdFile'), createJobDescription);
router.get('/', authenticateToken, getJobDescriptions);
router.get('/:id', authenticateToken, getJobDescriptionById);

module.exports = router;
