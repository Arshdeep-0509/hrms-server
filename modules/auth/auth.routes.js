const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { protect } = require('../../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', authController.registerUser.bind(authController));

// POST /api/auth/login
router.post('/login', authController.loginUser.bind(authController));

// POST /api/auth/logout (Requires a token to ensure the user is who they say they are)
router.post('/logout', protect, authController.logoutUser.bind(authController));

module.exports = router;

