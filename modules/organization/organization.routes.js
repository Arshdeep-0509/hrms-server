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
// Supports both MongoDB _id (24 hex) and organization_id (numeric)
router.get('/:id', protect, superAdminOrClientAdmin, organizationController.getOrganizationDetails.bind(organizationController));

// 4. Update client info
// PUT /api/organizations/:id
// Supports both MongoDB _id (24 hex) and organization_id (numeric)
router.put('/:id', protect, superAdminOnly, organizationController.updateOrganization.bind(organizationController));

// 5. Delete organization
// DELETE /api/organizations/:id
// Supports both MongoDB _id (24 hex) and organization_id (numeric)
router.delete('/:id', protect, superAdminOnly, organizationController.deleteOrganization.bind(organizationController));

// 6. Configure HR/payroll policies
// PUT /api/organizations/:id/settings
// Supports both MongoDB _id (24 hex) and organization_id (numeric)
router.put('/:id/settings', protect, clientAdminOnly, organizationController.configurePolicies.bind(organizationController));

// 7. Assign HR Account Manager
// POST /api/organizations/:id/assign-account-manager
// Supports both MongoDB _id (24 hex) and organization_id (numeric)
router.post('/:id/assign-account-manager', protect, superAdminOnly, organizationController.assignAccountManager.bind(organizationController));

// 8. Assign Client Admin
// POST /api/organizations/:id/assign-client-admin
// Supports both MongoDB _id (24 hex) and organization_id (numeric)
router.post('/:id/assign-client-admin', protect, superAdminOnly, organizationController.assignClientAdmin.bind(organizationController));

module.exports = router;

