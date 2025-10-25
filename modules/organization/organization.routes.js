const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const organizationController = require('./organization.controller');

const router = express.Router();

// Define Role-Based Authorizations
const superAdminOnly = authorize(['Super Admin']);
const superAdminOrClientManager = authorize(['Super Admin', 'Client Manager']);
const clientAdminOnly = authorize(['Client Admin']);
const superAdminOrClientAdmin = authorize(['Super Admin', 'Client Admin']);

// 1. List all client organizations
// GET /api/organizations
router.get('/', protect, superAdminOrClientManager, organizationController.listOrganizations.bind(organizationController));

// 2. Create new client organization
// POST /api/organizations
router.post('/', protect, superAdminOnly, organizationController.createOrganization.bind(organizationController));

// 3. Get organization details
// GET /api/organizations/:id
router.get('/:id', protect, superAdminOrClientAdmin, organizationController.getOrganizationDetails.bind(organizationController));

// 4. Update client info
// PUT /api/organizations/:id
router.put('/:id', protect, superAdminOnly, organizationController.updateOrganization.bind(organizationController));

// 5. Delete organization
// DELETE /api/organizations/:id
router.delete('/:id', protect, superAdminOnly, organizationController.deleteOrganization.bind(organizationController));

// 6. Configure HR/payroll policies
// PUT /api/organizations/:id/settings
router.put('/:id/settings', protect, clientAdminOnly, organizationController.configurePolicies.bind(organizationController));

// 7. Assign HR Account Manager
// POST /api/organizations/:id/assign-account-manager
router.post('/:id/assign-account-manager', protect, superAdminOnly, organizationController.assignAccountManager.bind(organizationController));

module.exports = router;

