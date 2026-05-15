// Donation routes
const express = require('express');
const router = express.Router();
const {
  getDonations,
  getDonationById,
  createDonation,
  updateDonationStatus,
  volunteerClaim,
  deleteDonation,
  getMyDonations,
} = require('../controllers/donationController');
const { protect } = require('../middleware/auth');

// All donation routes require authentication
router.use(protect);

router.get('/', getDonations);                         // GET  /api/donations
router.get('/my', getMyDonations);                     // GET  /api/donations/my
router.get('/:id', getDonationById);                   // GET  /api/donations/:id
router.post('/', createDonation);                      // POST /api/donations
router.patch('/:id/status', updateDonationStatus);     // PATCH /api/donations/:id/status  (donor only)
router.patch('/:id/volunteer', volunteerClaim);        // PATCH /api/donations/:id/volunteer (volunteer only)
router.delete('/:id', deleteDonation);                 // DELETE /api/donations/:id

module.exports = router;
