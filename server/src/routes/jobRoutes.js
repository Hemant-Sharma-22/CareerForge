const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuthenticateToken } = require('../middleware/authMiddleware');
const {
  searchJobs,
  saveJob,
  unsaveJob,
  getSavedJobs
} = require('../controllers/jobController');

router.post('/search', optionalAuthenticateToken, searchJobs);
router.get('/saved/list', authenticateToken, getSavedJobs);
router.post('/:id/save', authenticateToken, saveJob);
router.delete('/:id/save', authenticateToken, unsaveJob);

module.exports = router;
