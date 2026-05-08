// Request routes
const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  respondToRequest,
  getRequestHistory,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

// All request routes require authentication
router.use(protect);

router.get('/', getRequests);                     // GET  /api/requests
router.get('/history', getRequestHistory);        // GET  /api/requests/history
router.post('/', createRequest);                  // POST /api/requests
router.patch('/:id', respondToRequest);           // PATCH /api/requests/:id

module.exports = router;
