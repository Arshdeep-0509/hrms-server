const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const userController = require('./user.controller');

const router = express.Router();

// Route 1: Get user profile
// Only requires authentication (protect)
router.get('/profile', protect, userController.getUserProfile.bind(userController));

// Route 2: Update user profile
// Only requires authentication (protect)
router.patch('/profile', protect, userController.updateUserProfile.bind(userController));

// Route 3: Delete user by ID (Protected by RBAC)
// Requires authentication (protect) AND specific roles (authorize)
router.delete('/:user_id', protect, authorize(['Super Admin', 'Client Admin']), userController.deleteUser.bind(userController));

module.exports = router;

