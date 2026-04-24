const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

// @route   POST /api/bookings
router.post('/', auth, bookingController.createBooking);

// @route   GET /api/bookings/my-bookings
router.get('/my-bookings', auth, bookingController.getMyBookings);

// @route   GET /api/bookings (Admin Only)
router.get('/', auth, bookingController.getAllBookings);

// @route   GET /api/bookings/event/:eventId (Admin Only)
router.get('/event/:eventId', auth, bookingController.getBookingsByEvent);

module.exports = router;
