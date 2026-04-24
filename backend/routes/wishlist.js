const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const auth = require('../middleware/auth');

// Check if event is in wishlist
router.get('/check/:eventId', auth, wishlistController.checkWishlist);

// Get user's wishlist
router.get('/', auth, wishlistController.getWishlist);

// Add to wishlist
router.post('/add', auth, wishlistController.addToWishlist);

// Remove from wishlist
router.delete('/remove/:eventId', auth, wishlistController.removeFromWishlist);

module.exports = router;
