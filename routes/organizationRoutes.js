// routes/organizationRoutes.js
const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  listOrganizations,
  createOrganization,
  getOrganizationDetails,
  updateOrganization,
  deleteOrganization,
  configurePolicies,
  assignAccountManager
} = require('../controllers/organizationController');

const router = express.Router();

// Define Role-Based Authorizations
const superAdminOnly = authorize(['Super Admin']);
const superAdminOrClientManager = authorize(['Super Admin', 'Client Manager']);
const clientAdminOnly = authorize(['Client Admin']);
const superAdminOrClientAdmin = authorize(['Super Admin', 'Client Admin']);


// 1. List all client organizations
// GET /api/organizations
router.get('/', protect, superAdminOrClientManager, listOrganizations);

// 2. Create new client organization
// POST /api/organizations
router.post('/', protect, superAdminOnly, createOrganization);

// 3. Get organization details (Note: Client Admin authorization check is inside the controller)
// GET /api/organizations/:id
router.get('/:id', protect, superAdminOrClientAdmin, getOrganizationDetails);

// 4. Update client info
// PUT /api/organizations/:id
router.put('/:id', protect, superAdminOnly, updateOrganization);

// 5. Delete organization
// DELETE /api/organizations/:id
router.delete('/:id', protect, superAdminOnly, deleteOrganization);

// 6. Configure HR/payroll policies (Note: Organization ownership check is inside the controller)
// PUT /api/organizations/:id/settings
router.put('/:id/settings', protect, clientAdminOnly, configurePolicies);

// 7. Assign HR Account Manager
// POST /api/organizations/:id/assign-account-manager
router.post('/:id/assign-account-manager', protect, superAdminOnly, assignAccountManager);

module.exports = router;