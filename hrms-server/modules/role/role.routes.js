const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const roleController = require('./role.controller');

const router = express.Router();

// Role Management (Requires Super Admin)
const superAdminOnly = authorize(['Super Admin']);
// Role Assignment (Requires Super Admin OR Client Admin)
const adminRoles = authorize(['Super Admin', 'Client Admin']);

// Role Management Routes

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Fetch all roles and permissions
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles and permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       roleName:
 *                         type: string
 *                         enum: [Super Admin, Client Admin, HR Account Manager, Employee, Payroll Specialist, Bookkeeping, Recruitment Specialist]
 *                       description:
 *                         type: string
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: string
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
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
/**
 * @swagger
 * /api/roles/user/{user_id}:
 *   get:
 *     summary: Get user's current role and permissions
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User role and permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 role:
 *                   type: object
 *                   properties:
 *                     roleName:
 *                       type: string
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     accessRules:
 *                       type: object
 *       404:
 *         description: User not found
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
router.get('/user/:user_id', protect, superAdminOnly, roleController.getUserRole.bind(roleController));

router.get('/', protect, superAdminOnly, roleController.getAllRolesAndPermissions.bind(roleController));

/**
 * @swagger
 * /api/roles/update-user-role:
 *   patch:
 *     summary: Update role of a user
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - newRole
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: User ID
 *               newRole:
 *                 type: string
 *                 enum: [Super Admin, Client Admin, HR Account Manager, Employee, Payroll Specialist, Bookkeeping, Recruitment Specialist]
 *                 description: New role to assign
 *               reason:
 *                 type: string
 *                 description: Reason for role change
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 description: Effective date for role change
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 previousRole:
 *                   type: string
 *                 newRole:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
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
router.patch('/update-user-role', protect, adminRoles, roleController.updateUserRole.bind(roleController));

/**
 * @swagger
 * /api/roles/{roleName}:
 *   get:
 *     summary: Get access rules for a specific role
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Super Admin, Client Admin, HR Account Manager, Employee, Payroll Specialist, Bookkeeping, Recruitment Specialist]
 *         description: Role name
 *     responses:
 *       200:
 *         description: Role access rules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roleName:
 *                   type: string
 *                 description:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 accessRules:
 *                   type: object
 *                   properties:
 *                     modules:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           module:
 *                             type: string
 *                           access:
 *                             type: string
 *                             enum: [read, write, admin, none]
 *                           restrictions:
 *                             type: array
 *                             items:
 *                               type: string
 *                 isActive:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Role not found
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
router.get('/:roleName', protect, superAdminOnly, roleController.getRoleAccessRules.bind(roleController));

/**
 * @swagger
 * /api/roles/{roleName}/access:
 *   patch:
 *     summary: Modify access rights dynamically
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Super Admin, Client Admin, HR Account Manager, Employee, Payroll Specialist, Bookkeeping, Recruitment Specialist]
 *         description: Role name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessRules
 *             properties:
 *               accessRules:
 *                 type: object
 *                 properties:
 *                   modules:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         module:
 *                           type: string
 *                           enum: [auth, user, role, organization, employee, payroll, attendance, finance, recruitment]
 *                         access:
 *                           type: string
 *                           enum: [read, write, admin, none]
 *                         restrictions:
 *                           type: array
 *                           items:
 *                             type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of permissions to add/remove
 *               reason:
 *                 type: string
 *                 description: Reason for access modification
 *     responses:
 *       200:
 *         description: Role access rights updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 role:
 *                   type: object
 *                   properties:
 *                     roleName:
 *                       type: string
 *                     accessRules:
 *                       type: object
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
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
 *       404:
 *         description: Role not found
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
router.patch('/:roleName/access', protect, superAdminOnly, roleController.modifyRoleAccess.bind(roleController));

module.exports = router;

