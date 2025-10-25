const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const roleController = require('./role.controller');

const router = express.Router();

// Role Management (Requires Super Admin)
const superAdminOnly = authorize(['Super Admin']);
// Role Assignment (Requires Super Admin OR Client Admin)
const adminRoles = authorize(['Super Admin', 'Client Admin']);

// 1. Fetch all roles & permissions
// GET /api/roles/
router.get('/', protect, superAdminOnly, roleController.getAllRolesAndPermissions.bind(roleController));

// 2. Update role of a user
// PATCH /api/roles/update-user-role
router.patch('/update-user-role', protect, adminRoles, roleController.updateUserRole.bind(roleController));

// 3. Get access rules for a specific role
// GET /api/roles/:roleName
router.get('/:roleName', protect, superAdminOnly, roleController.getRoleAccessRules.bind(roleController));

// 4. Modify access rights dynamically
// PATCH /api/roles/:roleName/access
router.patch('/:roleName/access', protect, superAdminOnly, roleController.modifyRoleAccess.bind(roleController));

module.exports = router;

