const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMyDeliveries, createDelivery, updateDeliveryStatus } = require('../controllers/deliveryController');

router.get('/', protect, getMyDeliveries);
router.post('/', protect, createDelivery);
router.patch('/:id', protect, updateDeliveryStatus);

module.exports = router;
