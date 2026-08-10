const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication
} = require('../controllers/applicationController');

router.post('/', authenticateToken, createApplication);
router.get('/', authenticateToken, getApplications);
router.patch('/:id', authenticateToken, updateApplication);
router.delete('/:id', authenticateToken, deleteApplication);

module.exports = router;
