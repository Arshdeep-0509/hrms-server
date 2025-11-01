const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const leaveController = require('./leave.controller');

const router = express.Router();

// Define Role-Based Authorizations
const superAdminOrClientAdmin = authorize(['Super Admin', 'Client Admin']);

/**
 * @swagger
 * /api/leave/apply:
 *   post:
 *     summary: Apply for leave
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leaveType
 *               - startDate
 *               - endDate
 *               - reason
 *             properties:
 *               leaveType:
 *                 type: string
 *                 description: Type of leave (e.g., Annual, Sick, Personal)
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of leave
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of leave
 *               reason:
 *                 type: string
 *                 description: Reason for leave
 *               halfDay:
 *                 type: boolean
 *                 default: false
 *                 description: Whether it's a half-day leave
 *               emergencyContact:
 *                 type: string
 *                 description: Emergency contact information
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: URLs or paths to supporting documents
 *     responses:
 *       201:
 *         description: Leave application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 leaveApplication:
 *                   type: object
 *                   properties:
 *                     applicationId:
 *                       type: integer
 *                     employeeId:
 *                       type: integer
 *                     leaveType:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                       enum: [Pending, Approved, Rejected]
 *                     appliedDate:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
router.post('/apply', protect, leaveController.applyForLeave.bind(leaveController));

/**
 * @swagger
 * /api/leave/approve/{id}:
 *   put:
 *     summary: Approve or reject leave application
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Leave application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Action to take on the leave application
 *               comments:
 *                 type: string
 *                 description: Comments from approver
 *               approvedBy:
 *                 type: integer
 *                 description: ID of the approver
 *     responses:
 *       200:
 *         description: Leave application processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 leaveApplication:
 *                   type: object
 *                   properties:
 *                     applicationId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [Approved, Rejected]
 *                     approvedDate:
 *                       type: string
 *                       format: date-time
 *                     approvedBy:
 *                       type: integer
 *       404:
 *         description: Leave application not found
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
router.put('/approve/:id', protect, superAdminOrClientAdmin, leaveController.approveOrRejectLeave.bind(leaveController));

/**
 * @swagger
 * /api/leave/policy/create:
 *   post:
 *     summary: Create leave policy
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationId
 *               - policyName
 *               - leaveTypes
 *             properties:
 *               organizationId:
 *                 type: integer
 *                 description: Organization ID
 *               policyName:
 *                 type: string
 *                 description: Name of the leave policy
 *               description:
 *                 type: string
 *                 description: Policy description
 *               leaveTypes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     typeName:
 *                       type: string
 *                       description: Name of leave type
 *                     maxDays:
 *                       type: integer
 *                       description: Maximum days allowed per year
 *                     carryForward:
 *                       type: boolean
 *                       description: Whether unused days can be carried forward
 *                     requiresApproval:
 *                       type: boolean
 *                       description: Whether this leave type requires approval
 *                     isPaid:
 *                       type: boolean
 *                       description: Whether this leave type is paid
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 description: When the policy becomes effective
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the policy is active
 *     responses:
 *       201:
 *         description: Leave policy created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 policy:
 *                   type: object
 *                   properties:
 *                     policyId:
 *                       type: integer
 *                     policyName:
 *                       type: string
 *                     organizationId:
 *                       type: integer
 *                     effectiveDate:
 *                       type: string
 *                       format: date
 *                     isActive:
 *                       type: boolean
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
router.post('/policy/create', protect, superAdminOrClientAdmin, leaveController.createLeavePolicy.bind(leaveController));

/**
 * @swagger
 * /api/leave/balance/{employeeId}:
 *   get:
 *     summary: Get leave balance for employee
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for which to get balance (defaults to current year)
 *     responses:
 *       200:
 *         description: Leave balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 employeeId:
 *                   type: integer
 *                 year:
 *                   type: integer
 *                 leaveBalances:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       leaveType:
 *                         type: string
 *                       totalDays:
 *                         type: integer
 *                       usedDays:
 *                         type: integer
 *                       remainingDays:
 *                         type: integer
 *                       carryForwardDays:
 *                         type: integer
 *                 totalUsedDays:
 *                   type: integer
 *                 totalRemainingDays:
 *                   type: integer
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
router.get('/balance/:employeeId', protect, leaveController.getLeaveBalance.bind(leaveController));

/**
 * @swagger
 * /api/leave/reports:
 *   get:
 *     summary: Get leave reports
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: integer
 *         description: Organization ID
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *         description: Department ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Report start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Report end date
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [summary, detailed, utilization, trends]
 *         description: Type of report
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [JSON, PDF, Excel]
 *           default: JSON
 *         description: Report format
 *     responses:
 *       200:
 *         description: Leave reports generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reportType:
 *                   type: string
 *                 period:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalApplications:
 *                       type: integer
 *                     approvedApplications:
 *                       type: integer
 *                     rejectedApplications:
 *                       type: integer
 *                     pendingApplications:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
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
router.get('/reports', protect, superAdminOrClientAdmin, leaveController.getLeaveReports.bind(leaveController));

/**
 * @swagger
 * /api/leave/holidays/add:
 *   post:
 *     summary: Add holiday
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationId
 *               - holidayName
 *               - holidayDate
 *             properties:
 *               organizationId:
 *                 type: integer
 *                 description: Organization ID
 *               holidayName:
 *                 type: string
 *                 description: Name of the holiday
 *               holidayDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the holiday
 *               description:
 *                 type: string
 *                 description: Holiday description
 *               isRecurring:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this is a recurring holiday
 *               isOptional:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this is an optional holiday
 *     responses:
 *       201:
 *         description: Holiday added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 holiday:
 *                   type: object
 *                   properties:
 *                     holidayId:
 *                       type: integer
 *                     holidayName:
 *                       type: string
 *                     holidayDate:
 *                       type: string
 *                       format: date
 *                     organizationId:
 *                       type: integer
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
router.post('/holidays/add', protect, superAdminOrClientAdmin, leaveController.addHoliday.bind(leaveController));

/**
 * @swagger
 * /api/leave/holidays/list:
 *   get:
 *     summary: List holidays
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: integer
 *         description: Organization ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for which to list holidays
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month for which to list holidays
 *     responses:
 *       200:
 *         description: Holidays retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 holidays:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       holidayId:
 *                         type: integer
 *                       holidayName:
 *                         type: string
 *                       holidayDate:
 *                         type: string
 *                         format: date
 *                       description:
 *                         type: string
 *                       isRecurring:
 *                         type: boolean
 *                       isOptional:
 *                         type: boolean
 *                 totalHolidays:
 *                   type: integer
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
router.get('/holidays/list', protect, superAdminOrClientAdmin, leaveController.listHolidays.bind(leaveController));

/**
 * @swagger
 * /api/leave/calendar:
 *   get:
 *     summary: Get calendar view
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: integer
 *         description: Organization ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for calendar view
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month for calendar view
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *         description: Department ID for filtering
 *     responses:
 *       200:
 *         description: Calendar view retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: integer
 *                 month:
 *                   type: integer
 *                 calendar:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       dayOfWeek:
 *                         type: string
 *                       isHoliday:
 *                         type: boolean
 *                       holidayName:
 *                         type: string
 *                       leaveApplications:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             employeeId:
 *                               type: integer
 *                             employeeName:
 *                               type: string
 *                             leaveType:
 *                               type: string
 *                             status:
 *                               type: string
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
router.get('/calendar', protect, superAdminOrClientAdmin, leaveController.getCalendarView.bind(leaveController));

/**
 * @swagger
 * /api/leave/type/create:
 *   post:
 *     summary: Create leave type
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationId
 *               - typeName
 *               - maxDays
 *             properties:
 *               organizationId:
 *                 type: integer
 *                 description: Organization ID
 *               typeName:
 *                 type: string
 *                 description: Name of the leave type
 *               maxDays:
 *                 type: integer
 *                 description: Maximum days allowed per year
 *               description:
 *                 type: string
 *                 description: Leave type description
 *               carryForward:
 *                 type: boolean
 *                 default: false
 *                 description: Whether unused days can be carried forward
 *               requiresApproval:
 *                 type: boolean
 *                 default: true
 *                 description: Whether this leave type requires approval
 *               isPaid:
 *                 type: boolean
 *                 default: true
 *                 description: Whether this leave type is paid
 *               colorCode:
 *                 type: string
 *                 description: Color code for calendar display
 *     responses:
 *       201:
 *         description: Leave type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 leaveType:
 *                   type: object
 *                   properties:
 *                     typeId:
 *                       type: integer
 *                     typeName:
 *                       type: string
 *                     maxDays:
 *                       type: integer
 *                     organizationId:
 *                       type: integer
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
router.post('/type/create', protect, superAdminOrClientAdmin, leaveController.createLeaveType.bind(leaveController));

/**
 * @swagger
 * /api/leave/type/list:
 *   get:
 *     summary: List leave types
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: integer
 *         description: Organization ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Leave types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leaveTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       typeId:
 *                         type: integer
 *                       typeName:
 *                         type: string
 *                       maxDays:
 *                         type: integer
 *                       description:
 *                         type: string
 *                       carryForward:
 *                         type: boolean
 *                       requiresApproval:
 *                         type: boolean
 *                       isPaid:
 *                         type: boolean
 *                       isActive:
 *                         type: boolean
 *                       colorCode:
 *                         type: string
 *                 totalTypes:
 *                   type: integer
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
router.get('/type/list', protect, superAdminOrClientAdmin, leaveController.listLeaveTypes.bind(leaveController));

/**
 * @swagger
 * /api/leave/type/update/{id}:
 *   put:
 *     summary: Update leave type
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Leave type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeName:
 *                 type: string
 *                 description: Name of the leave type
 *               maxDays:
 *                 type: integer
 *                 description: Maximum days allowed per year
 *               description:
 *                 type: string
 *                 description: Leave type description
 *               carryForward:
 *                 type: boolean
 *                 description: Whether unused days can be carried forward
 *               requiresApproval:
 *                 type: boolean
 *                 description: Whether this leave type requires approval
 *               isPaid:
 *                 type: boolean
 *                 description: Whether this leave type is paid
 *               isActive:
 *                 type: boolean
 *                 description: Whether the leave type is active
 *               colorCode:
 *                 type: string
 *                 description: Color code for calendar display
 *     responses:
 *       200:
 *         description: Leave type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 leaveType:
 *                   type: object
 *                   properties:
 *                     typeId:
 *                       type: integer
 *                     typeName:
 *                       type: string
 *                     maxDays:
 *                       type: integer
 *                     isActive:
 *                       type: boolean
 *       404:
 *         description: Leave type not found
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
router.put('/type/update/:id', protect, superAdminOrClientAdmin, leaveController.updateLeaveType.bind(leaveController));

module.exports = router;

