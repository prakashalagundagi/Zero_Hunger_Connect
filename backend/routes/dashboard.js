// Dashboard routes
const express = require('express');
const router = express.Router();
const { getDashboardData, getUserStats, getPlatformStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(protect);

router.get('/', getDashboardData);             // GET /api/dashboard
router.get('/stats', getUserStats);            // GET /api/dashboard/stats
router.get('/platform', getPlatformStats);     // GET /api/dashboard/platform

module.exports = router;
