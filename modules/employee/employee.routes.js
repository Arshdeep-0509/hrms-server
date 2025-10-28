const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const employeeController = require('./employee.controller');

const router = express.Router();

// Define Role-Based Authorizations
const superAdminOrClientAdmin = authorize(['Super Admin', 'Client Admin']);
const clientAdminOrHR = authorize(['Client Admin', 'HR Account Manager']);
const hrOrClientAdmin = authorize(['HR Account Manager', 'Client Admin']);
const hrOrEmployee = authorize(['HR Account Manager', 'Employee']);

// Employee Management Routes

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: List all employees with filters
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: employmentStatus
 *         schema:
 *           type: string
 *           enum: [Active, Inactive, On Leave, Terminated, Resigned]
 *         description: Filter by employment status
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or position
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
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
router.get('/', protect, superAdminOrClientAdmin, employeeController.listEmployees.bind(employeeController));

/**
 * @swagger
 * /api/employees/{employee_id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
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
router.get('/:employee_id', protect, employeeController.getEmployee.bind(employeeController));

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create new employee
 *     tags: [Employee]
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
 *               - organization_id
 *               - role_id
 *               - employee_id
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - position
 *               - department
 *               - department_id
 *               - employmentType
 *               - hireDate
 *               - workLocation
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: User ID
 *               organization_id:
 *                 type: integer
 *                 description: Organization ID
 *               role_id:
 *                 type: integer
 *                 description: Role ID
 *               employee_id:
 *                 type: integer
 *                 description: Employee ID
 *               firstName:
 *                 type: string
 *                 description: First name
 *               lastName:
 *                 type: string
 *                 description: Last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               position:
 *                 type: string
 *                 description: Job position
 *               department:
 *                 type: string
 *                 description: Department
 *               department_id:
 *                 type: integer
 *                 description: Department ID
 *               employmentType:
 *                 type: string
 *                 enum: [Full-time, Part-time, Contract, Intern, Temporary]
 *                 description: Employment type
 *               hireDate:
 *                 type: string
 *                 format: date
 *                 description: Hire date
 *               salary:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                   currency:
 *                     type: string
 *                     enum: [USD, INR, EUR, GBP, CAD, AUD, JPY]
 *                   payFrequency:
 *                     type: string
 *                     enum: [Weekly, Bi-weekly, Monthly, Annually]
 *               workLocation:
 *                 type: string
 *                 description: Work location
 *               manager_id:
 *                 type: integer
 *                 description: Manager employee ID
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 employee:
 *                   $ref: '#/components/schemas/Employee'
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
router.post('/', protect, clientAdminOrHR, employeeController.createEmployee.bind(employeeController));

/**
 * @swagger
 * /api/employees/{employee_id}:
 *   put:
 *     summary: Update employee details
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: First name
 *               lastName:
 *                 type: string
 *                 description: Last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               position:
 *                 type: string
 *                 description: Job position
 *               department:
 *                 type: string
 *                 description: Department
 *               department_id:
 *                 type: integer
 *                 description: Department ID
 *               employmentType:
 *                 type: string
 *                 enum: [Full-time, Part-time, Contract, Intern, Temporary]
 *                 description: Employment type
 *               employmentStatus:
 *                 type: string
 *                 enum: [Active, Inactive, On Leave, Terminated, Resigned]
 *                 description: Employment status
 *               salary:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                   currency:
 *                     type: string
 *                     enum: [USD, INR, EUR, GBP, CAD, AUD, JPY]
 *                   payFrequency:
 *                     type: string
 *                     enum: [Weekly, Bi-weekly, Monthly, Annually]
 *               workLocation:
 *                 type: string
 *                 description: Work location
 *               manager_id:
 *                 type: integer
 *                 description: Manager employee ID
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 employee:
 *                   $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
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
router.put('/:employee_id', protect, hrOrClientAdmin, employeeController.updateEmployee.bind(employeeController));

/**
 * @swagger
 * /api/employees/{employee_id}/status:
 *   put:
 *     summary: Update employee status
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employmentStatus
 *             properties:
 *               employmentStatus:
 *                 type: string
 *                 enum: [Active, Inactive, On Leave, Terminated, Resigned]
 *                 description: New employment status
 *               reason:
 *                 type: string
 *                 description: Reason for status change
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 description: Effective date for status change
 *     responses:
 *       200:
 *         description: Employee status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 employee:
 *                   $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
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
router.put('/:employee_id/status', protect, hrOrClientAdmin, employeeController.updateEmployeeStatus.bind(employeeController));

/**
 * @swagger
 * /api/employees/{employee_id}/documents:
 *   post:
 *     summary: Upload document for employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *               - documentType
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Document file
 *               documentType:
 *                 type: string
 *                 enum: [Contract, ID, Resume, Certificate, Other]
 *                 description: Type of document
 *               description:
 *                 type: string
 *                 description: Document description
 *               isConfidential:
 *                 type: boolean
 *                 default: false
 *                 description: Whether document is confidential
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 document:
 *                   type: object
 *                   properties:
 *                     document_id:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     documentType:
 *                       type: string
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Employee not found
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
router.post('/:employee_id/documents', protect, hrOrEmployee, employeeController.uploadDocument.bind(employeeController));

/**
 * @swagger
 * /api/employees/{employee_id}/onboarding:
 *   post:
 *     summary: Trigger onboarding workflow
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Onboarding start date
 *               checklist:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     task:
 *                       type: string
 *                     assignedTo:
 *                       type: string
 *                     dueDate:
 *                       type: string
 *                       format: date
 *               notes:
 *                 type: string
 *                 description: Onboarding notes
 *     responses:
 *       201:
 *         description: Onboarding workflow started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 onboarding:
 *                   type: object
 *                   properties:
 *                     onboarding_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [Pending, In Progress, Completed]
 *                     startDate:
 *                       type: string
 *                       format: date
 *       404:
 *         description: Employee not found
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
router.post('/:employee_id/onboarding', protect, hrOrClientAdmin, employeeController.startOnboarding.bind(employeeController));

/**
 * @swagger
 * /api/employees/{employee_id}/offboarding:
 *   post:
 *     summary: Trigger offboarding workflow
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lastWorkingDate
 *               - reason
 *             properties:
 *               lastWorkingDate:
 *                 type: string
 *                 format: date
 *                 description: Last working date
 *               reason:
 *                 type: string
 *                 enum: [Resignation, Termination, Retirement, End of Contract]
 *                 description: Reason for offboarding
 *               checklist:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     task:
 *                       type: string
 *                     assignedTo:
 *                       type: string
 *                     dueDate:
 *                       type: string
 *                       format: date
 *               notes:
 *                 type: string
 *                 description: Offboarding notes
 *     responses:
 *       201:
 *         description: Offboarding workflow started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 offboarding:
 *                   type: object
 *                   properties:
 *                     offboarding_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [Pending, In Progress, Completed]
 *                     lastWorkingDate:
 *                       type: string
 *                       format: date
 *       404:
 *         description: Employee not found
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
router.post('/:employee_id/offboarding', protect, hrOrClientAdmin, employeeController.startOffboarding.bind(employeeController));

module.exports = router;
