const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getDashboardStats } = require('../controllers/analyticsController');

router.get('/dashboard', authenticateToken, getDashboardStats);

module.exports = router;
