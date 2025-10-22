const express = require('express');
const router = express.Router();
const{registerUser,loginUser , logoutUser} = require("../controllers/authController")
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/logout (Requires a token to ensure the user is who they say they are)
router.post('/logout', protect, logoutUser);

module.exports = router