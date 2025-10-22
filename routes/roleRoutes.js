const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  getAllRolesAndPermissions,
  updateUserRole,
  getRoleAccessRules,
  modifyRoleAccess
} = require('../controllers/roleController');

const router = express.Router();

// Role Management (Requires Super Admin)
const superAdminOnly = authorize(['Super Admin']);
// Role Assignment (Requires Super Admin OR Client Admin)
const adminRoles = authorize(['Super Admin', 'Client Admin']);


// 1. Fetch all roles & permissions
// GET /api/roles/
router.get('/', protect, superAdminOnly, getAllRolesAndPermissions);

// 2. Update role of a user
// PATCH /api/roles/update-user-role  <-- New, more descriptive path
router.patch('/update-user-role', protect, adminRoles, updateUserRole);

// 3. Get access rules for a specific role
// GET /api/roles/:roleName
router.get('/:roleName', protect, superAdminOnly, getRoleAccessRules);

// 4. Modify access rights dynamically
// PATCH /api/roles/:roleName/access
router.patch('/:roleName/access', protect, superAdminOnly, modifyRoleAccess);

module.exports = router;