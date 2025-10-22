const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  getUserProfile, 
  updateUserProfile, 
  deleteUser 
} = require('../controllers/userController');

const router = express.Router();

// Route 1: Get user profile
// Only requires authentication (protect)
router.get('/profile', protect, getUserProfile);

// Route 2: Update user profile
// Only requires authentication (protect)
router.patch('/profile', protect, updateUserProfile);

// Route 3: Delete user by ID (Protected by RBAC)
// Requires authentication (protect) AND specific roles (authorize)
router.delete('/:id', protect, authorize(['Super Admin', 'Client Admin']), deleteUser);

module.exports = router;