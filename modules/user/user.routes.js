const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const userController = require('./user.controller');

const router = express.Router();

// Define Role-Based Authorizations
const superAdminOnly = authorize(['Super Admin']);
const superAdminOrClientAdmin = authorize(['Super Admin', 'Client Admin']);

// Route 1: List all users (with filters by org/department/role)
// GET /api/users?organization_id=123&department_id=456&role=Employee
// Super Admin sees all, Client Admin sees only their org
router.get('/', protect, superAdminOrClientAdmin, userController.listUsers.bind(userController));

// Route 2: Create new user (employee, admin, etc.)
// POST /api/users
router.post('/', protect, superAdminOrClientAdmin, userController.createUser.bind(userController));

// Route 3: Get user profile
// Only requires authentication (protect)
router.get('/profile', protect, userController.getUserProfile.bind(userController));

// Route 4: Update user profile
// Only requires authentication (protect)
router.patch('/profile', protect, userController.updateUserProfile.bind(userController));

// Route 5: Update user info or status
// PATCH /api/users/:id
router.patch('/:id', protect, superAdminOrClientAdmin, userController.updateUser.bind(userController));

// Route 6: Delete user by ID (Protected by RBAC)
// Requires authentication (protect) AND specific roles (authorize)
router.delete('/:user_id', protect, superAdminOrClientAdmin, userController.deleteUser.bind(userController));

module.exports = router;

