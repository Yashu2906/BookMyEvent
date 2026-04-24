const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
router.post('/register', authController.registerUser);

// @route   POST /api/auth/login
router.post('/login', authController.loginUser);

const auth = require('../middleware/auth');

// @route   GET /api/auth/profile
router.get('/profile', auth, authController.getUserProfile);
router.put('/profile', auth, authController.updateUserProfile);

// google login
router.post('/google-login', authController.googleLogin);

// otp
router.post('/send-otp', authController.sendOTP);

// forgot password
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/users', auth, authController.getAllUsers);

module.exports = router;
