const express = require('express');
const router = express.Router();
const { register, googleAuth, login, resetPassword, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/google', googleAuth);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateToken, getMe);

module.exports = router;
