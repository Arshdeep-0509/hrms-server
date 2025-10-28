const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const departmentController = require('./department.controller');

const router = express.Router();

// Define Role-Based Authorizations
const superAdminOrClientAdmin = authorize(['Super Admin', 'Client Admin']);
const clientAdminOnly = authorize(['Client Admin']);

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: List all departments
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organization_id
 *         schema:
 *           type: integer
 *         description: Filter by organization ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by department name
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   department_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   organization_id:
 *                     type: integer
 *                   manager_id:
 *                     type: integer
 *                   isActive:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   employeeCount:
 *                     type: integer
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
router.get('/', protect, superAdminOrClientAdmin, departmentController.listDepartments.bind(departmentController));

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get department details by ID
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 department_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 organization_id:
 *                   type: integer
 *                 manager_id:
 *                   type: integer
 *                 isActive:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 employees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       employee_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       position:
 *                         type: string
 *                       email:
 *                         type: string
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       role_id:
 *                         type: integer
 *                       roleName:
 *                         type: string
 *                       description:
 *                         type: string
 *       404:
 *         description: Department not found
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
router.get('/:id', protect, superAdminOrClientAdmin, departmentController.getDepartmentDetails.bind(departmentController));

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create new department
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - organization_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: Department name
 *               description:
 *                 type: string
 *                 description: Department description
 *               organization_id:
 *                 type: integer
 *                 description: Organization ID
 *               manager_id:
 *                 type: integer
 *                 description: Manager employee ID
 *               budget:
 *                 type: number
 *                 description: Department budget
 *               location:
 *                 type: string
 *                 description: Department location
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the department is active
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 department:
 *                   type: object
 *                   properties:
 *                     department_id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     organization_id:
 *                       type: integer
 *                     manager_id:
 *                       type: integer
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
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
router.post('/', protect, superAdminOrClientAdmin, departmentController.createDepartment.bind(departmentController));

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Update department information
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Department name
 *               description:
 *                 type: string
 *                 description: Department description
 *               manager_id:
 *                 type: integer
 *                 description: Manager employee ID
 *               budget:
 *                 type: number
 *                 description: Department budget
 *               location:
 *                 type: string
 *                 description: Department location
 *               isActive:
 *                 type: boolean
 *                 description: Whether the department is active
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 department:
 *                   type: object
 *                   properties:
 *                     department_id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     organization_id:
 *                       type: integer
 *                     manager_id:
 *                       type: integer
 *                     isActive:
 *                       type: boolean
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Department not found
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
router.put('/:id', protect, superAdminOrClientAdmin, departmentController.updateDepartment.bind(departmentController));

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Delete department
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request - Department has employees
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
router.delete('/:id', protect, superAdminOrClientAdmin, departmentController.deleteDepartment.bind(departmentController));

/**
 * @swagger
 * /api/departments/{id}/roles:
 *   post:
 *     summary: Create new role within department
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleName
 *               - description
 *             properties:
 *               roleName:
 *                 type: string
 *                 description: Name of the role
 *               description:
 *                 type: string
 *                 description: Role description
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of responsibilities
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of requirements
 *               salaryRange:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                   max:
 *                     type: number
 *                   currency:
 *                     type: string
 *                 description: Salary range for the role
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the role is active
 *     responses:
 *       201:
 *         description: Role created successfully
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
 *                     role_id:
 *                       type: integer
 *                     roleName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     department_id:
 *                       type: integer
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Department not found
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
router.post('/:id/roles', protect, clientAdminOnly, departmentController.createRoleInDepartment.bind(departmentController));

/**
 * @swagger
 * /api/departments/{id}/assign-user:
 *   post:
 *     summary: Assign employee to department
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - position
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 description: Employee ID to assign
 *               position:
 *                 type: string
 *                 description: Position/role in the department
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of assignment
 *               reportingManager:
 *                 type: integer
 *                 description: Reporting manager employee ID
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the assignment is active
 *     responses:
 *       200:
 *         description: Employee assigned to department successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 assignment:
 *                   type: object
 *                   properties:
 *                     employee_id:
 *                       type: integer
 *                     department_id:
 *                       type: integer
 *                     position:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     isActive:
 *                       type: boolean
 *       404:
 *         description: Department or employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request - Employee already assigned
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
router.post('/:id/assign-user', protect, clientAdminOnly, departmentController.assignEmployeeToDepartment.bind(departmentController));

module.exports = router;

