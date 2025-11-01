const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const organizationController = require('./organization.controller');

const router = express.Router();

// Define Role-Based Authorizations
const superAdminOnly = authorize(['Super Admin']);
const superAdminOrClientManager = authorize(['Super Admin', 'Client Manager']);
const clientAdminOnly = authorize(['Client Admin']);
const superAdminOrClientAdmin = authorize(['Super Admin', 'Client Admin']);

// Organization Management Routes

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: List all client organizations
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive, Suspended, Pending]
 *         description: Filter by organization status
 *       - in: query
 *         name: subscriptionPlan
 *         schema:
 *           type: string
 *           enum: [Basic, Professional, Enterprise]
 *         description: Filter by subscription plan
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by organization name
 *     responses:
 *       200:
 *         description: Organizations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Organization'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/organizations/{id}/users:
 *   get:
 *     summary: Get organization users
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by user role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive]
 *         description: Filter by user status
 *     responses:
 *       200:
 *         description: Organization users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/users', protect, superAdminOrClientAdmin, organizationController.getOrganizationUsers.bind(organizationController));

router.get('/', protect, superAdminOrClientManager, organizationController.listOrganizations.bind(organizationController));

/**
 * @swagger
 * /api/organizations:
 *   post:
 *     summary: Create new client organization
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organization_id
 *               - name
 *               - address
 *               - subscriptionPlan
 *             properties:
 *               organization_id:
 *                 type: integer
 *                 description: Unique organization identifier
 *               name:
 *                 type: string
 *                 description: Organization name
 *               address:
 *                 type: string
 *                 description: Organization address
 *               city:
 *                 type: string
 *                 description: City
 *               state:
 *                 type: string
 *                 description: State/Province
 *               country:
 *                 type: string
 *                 description: Country
 *               postalCode:
 *                 type: string
 *                 description: Postal/ZIP code
 *               phone:
 *                 type: string
 *                 description: Organization phone number
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Organization email
 *               website:
 *                 type: string
 *                 description: Organization website
 *               subscriptionPlan:
 *                 type: string
 *                 enum: [Basic, Professional, Enterprise]
 *                 description: Subscription plan
 *               industry:
 *                 type: string
 *                 description: Industry type
 *               size:
 *                 type: string
 *                 enum: [1-10, 11-50, 51-200, 201-500, 500+]
 *                 description: Organization size
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Suspended, Pending]
 *                 default: Pending
 *                 description: Organization status
 *     responses:
 *       201:
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 organization:
 *                   $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Super Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', protect, superAdminOnly, organizationController.createOrganization.bind(organizationController));

/**
 * @swagger
 * /api/organizations/{id}:
 *   get:
 *     summary: Get organization details
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID (MongoDB _id or organization_id)
 *     responses:
 *       200:
 *         description: Organization details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', protect, superAdminOrClientAdmin, organizationController.getOrganizationDetails.bind(organizationController));

/**
 * @swagger
 * /api/organizations/{id}:
 *   put:
 *     summary: Update organization information
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID (MongoDB _id or organization_id)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               website:
 *                 type: string
 *               subscriptionPlan:
 *                 type: string
 *                 enum: [Basic, Professional, Enterprise]
 *               industry:
 *                 type: string
 *               size:
 *                 type: string
 *                 enum: [1-10, 11-50, 51-200, 201-500, 500+]
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Suspended, Pending]
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 organization:
 *                   $ref: '#/components/schemas/Organization'
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Super Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', protect, superAdminOnly, organizationController.updateOrganization.bind(organizationController));

/**
 * @swagger
 * /api/organizations/{id}:
 *   delete:
 *     summary: Delete organization
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID (MongoDB _id or organization_id)
 *     responses:
 *       200:
 *         description: Organization deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Super Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', protect, superAdminOnly, organizationController.deleteOrganization.bind(organizationController));

/**
 * @swagger
 * /api/organizations/{id}/settings:
 *   put:
 *     summary: Configure HR/payroll policies
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID (MongoDB _id or organization_id)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hrPolicies:
 *                 type: object
 *                 properties:
 *                   workingHours:
 *                     type: object
 *                     properties:
 *                       startTime:
 *                         type: string
 *                         pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                       endTime:
 *                         type: string
 *                         pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                       workingDays:
 *                         type: array
 *                         items:
 *                           type: string
 *                           enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                   leavePolicies:
 *                     type: object
 *                     properties:
 *                       annualLeave:
 *                         type: number
 *                       sickLeave:
 *                         type: number
 *                       personalLeave:
 *                         type: number
 *               payrollPolicies:
 *                 type: object
 *                 properties:
 *                   payFrequency:
 *                     type: string
 *                     enum: [Weekly, Bi-weekly, Monthly, Annually]
 *                   overtimeRules:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                       dailyThreshold:
 *                         type: number
 *                       weeklyThreshold:
 *                         type: number
 *                       overtimeRate:
 *                         type: number
 *                   taxSettings:
 *                     type: object
 *                     properties:
 *                       taxYear:
 *                         type: string
 *                       taxBrackets:
 *                         type: array
 *                         items:
 *                           type: object
 *               notificationSettings:
 *                 type: object
 *                 properties:
 *                   emailNotifications:
 *                     type: boolean
 *                   smsNotifications:
 *                     type: boolean
 *                   pushNotifications:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Organization settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 settings:
 *                   type: object
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Client Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/settings', protect, clientAdminOnly, organizationController.configurePolicies.bind(organizationController));

/**
 * @swagger
 * /api/organizations/{id}/assign-account-manager:
 *   post:
 *     summary: Assign HR Account Manager
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID (MongoDB _id or organization_id)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hrAccountManager
 *             properties:
 *               hrAccountManager:
 *                 type: integer
 *                 description: User ID of HR Account Manager
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 description: Effective date for assignment
 *               notes:
 *                 type: string
 *                 description: Assignment notes
 *     responses:
 *       200:
 *         description: HR Account Manager assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 organization:
 *                   $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Organization or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Super Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/assign-account-manager', protect, superAdminOnly, organizationController.assignAccountManager.bind(organizationController));

/**
 * @swagger
 * /api/organizations/{id}/assign-client-admin:
 *   post:
 *     summary: Assign Client Admin
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID (MongoDB _id or organization_id)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientAdmin
 *             properties:
 *               clientAdmin:
 *                 type: integer
 *                 description: User ID of Client Admin
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 description: Effective date for assignment
 *               notes:
 *                 type: string
 *                 description: Assignment notes
 *     responses:
 *       200:
 *         description: Client Admin assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 organization:
 *                   $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Organization or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Super Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/assign-client-admin', protect, superAdminOnly, organizationController.assignClientAdmin.bind(organizationController));

module.exports = router;

