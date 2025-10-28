const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const attendanceController = require('./attendance.controller');

const router = express.Router();

// Define Role-Based Authorizations
const superAdminOrClientAdmin = authorize(['Super Admin', 'Client Admin']);
const hrOrClientAdmin = authorize(['HR Account Manager', 'Client Admin']);
const hrOrEmployee = authorize(['HR Account Manager', 'Employee']);
const allRoles = authorize(['Super Admin', 'Client Admin', 'HR Account Manager', 'Employee']);

// Attendance Management Routes

/**
 * @swagger
 * /api/attendance/clock-in:
 *   post:
 *     summary: Record employee check-in
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: integer
 *                 description: Employee ID
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     description: GPS latitude
 *                   longitude:
 *                     type: number
 *                     description: GPS longitude
 *                   address:
 *                     type: string
 *                     description: Location address
 *               deviceInfo:
 *                 type: object
 *                 properties:
 *                   deviceId:
 *                     type: string
 *                     description: Device identifier
 *                   platform:
 *                     type: string
 *                     description: Device platform
 *                   userAgent:
 *                     type: string
 *                     description: User agent string
 *               method:
 *                 type: string
 *                 enum: [Mobile App, Web Portal, Biometric, Card, Manual]
 *                 description: Clock in method
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Clock in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 attendanceRecord:
 *                   $ref: '#/components/schemas/AttendanceRecord'
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
router.post('/clock-in', protect, allRoles, attendanceController.clockIn.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/clock-out:
 *   post:
 *     summary: Record employee check-out
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: integer
 *                 description: Employee ID
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     description: GPS latitude
 *                   longitude:
 *                     type: number
 *                     description: GPS longitude
 *                   address:
 *                     type: string
 *                     description: Location address
 *               deviceInfo:
 *                 type: object
 *                 properties:
 *                   deviceId:
 *                     type: string
 *                     description: Device identifier
 *                   platform:
 *                     type: string
 *                     description: Device platform
 *                   userAgent:
 *                     type: string
 *                     description: User agent string
 *               method:
 *                 type: string
 *                 enum: [Mobile App, Web Portal, Biometric, Card, Manual]
 *                 description: Clock out method
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: Clock out successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 attendanceRecord:
 *                   $ref: '#/components/schemas/AttendanceRecord'
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
router.post('/clock-out', protect, allRoles, attendanceController.clockOut.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/shifts/create:
 *   post:
 *     summary: Create new shift
 *     tags: [Attendance]
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
 *               - startTime
 *               - endTime
 *             properties:
 *               organization_id:
 *                 type: integer
 *                 description: Organization ID
 *               name:
 *                 type: string
 *                 description: Shift name
 *               description:
 *                 type: string
 *                 description: Shift description
 *               startTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Start time (HH:MM)
 *               endTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: End time (HH:MM)
 *               breakDuration:
 *                 type: number
 *                 description: Break duration in minutes
 *               workingDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                 description: Working days
 *               overtimeRules:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   dailyOvertimeThreshold:
 *                     type: number
 *                   weeklyOvertimeThreshold:
 *                     type: number
 *                   overtimeRate:
 *                     type: number
 *                   doubleTimeRate:
 *                     type: number
 *     responses:
 *       201:
 *         description: Shift created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 shift:
 *                   $ref: '#/components/schemas/Shift'
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
router.post('/shifts/create', protect, hrOrClientAdmin, attendanceController.createShift.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/shifts:
 *   get:
 *     summary: List all shifts
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: isDefault
 *         schema:
 *           type: boolean
 *         description: Filter by default status
 *     responses:
 *       200:
 *         description: Shifts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shift'
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
router.get('/shifts', protect, hrOrClientAdmin, attendanceController.listShifts.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/shifts/{id}:
 *   get:
 *     summary: Get shift by ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shift'
 *       404:
 *         description: Shift not found
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
router.get('/shifts/:id', protect, hrOrClientAdmin, attendanceController.getShift.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/shifts/{id}:
 *   put:
 *     summary: Update shift
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shift ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               endTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               breakDuration:
 *                 type: number
 *               workingDays:
 *                 type: array
 *                 items:
 *                   type: string
 *               overtimeRules:
 *                 type: object
 *     responses:
 *       200:
 *         description: Shift updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 shift:
 *                   $ref: '#/components/schemas/Shift'
 *       404:
 *         description: Shift not found
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
router.put('/shifts/:id', protect, hrOrClientAdmin, attendanceController.updateShift.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/shifts/{id}:
 *   delete:
 *     summary: Delete shift
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Shift not found
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
router.delete('/shifts/:id', protect, hrOrClientAdmin, attendanceController.deleteShift.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/overtime/{id}:
 *   get:
 *     summary: Get overtime data for employee
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Overtime data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OvertimeRecord'
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
router.get('/overtime/:id', protect, hrOrEmployee, attendanceController.getOvertimeData.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/overtime/record/{id}:
 *   get:
 *     summary: Get overtime record by ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Overtime record ID
 *     responses:
 *       200:
 *         description: Overtime record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OvertimeRecord'
 *       404:
 *         description: Overtime record not found
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
router.get('/overtime/record/:id', protect, hrOrEmployee, attendanceController.getOvertimeRecord.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/overtime/record/{id}:
 *   put:
 *     summary: Update overtime record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Overtime record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               overtimeType:
 *                 type: string
 *                 enum: [Daily, Weekly, Holiday, Weekend, Emergency]
 *               regularHours:
 *                 type: number
 *               overtimeHours:
 *                 type: number
 *               doubleTimeHours:
 *                 type: number
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Overtime record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 overtimeRecord:
 *                   $ref: '#/components/schemas/OvertimeRecord'
 *       404:
 *         description: Overtime record not found
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
router.put('/overtime/record/:id', protect, hrOrClientAdmin, attendanceController.updateOvertimeRecord.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/overtime/record/{id}/approve:
 *   put:
 *     summary: Approve overtime record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Overtime record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *                 description: Whether to approve or reject
 *               notes:
 *                 type: string
 *                 description: Approval notes
 *               approvedBy:
 *                 type: string
 *                 description: User who approved
 *     responses:
 *       200:
 *         description: Overtime record approval updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 overtimeRecord:
 *                   $ref: '#/components/schemas/OvertimeRecord'
 *       404:
 *         description: Overtime record not found
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
router.put('/overtime/record/:id/approve', protect, hrOrClientAdmin, attendanceController.approveOvertimeRecord.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/reports:
 *   get:
 *     summary: Generate attendance reports
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organization_id
 *         schema:
 *           type: integer
 *         description: Organization ID
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [Summary, Detailed, Overtime, Absence, Late Arrivals]
 *         description: Type of attendance report
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Report start date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Report end date
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [JSON, PDF, Excel]
 *           default: JSON
 *         description: Report format
 *     responses:
 *       200:
 *         description: Attendance report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 report:
 *                   type: object
 *                   properties:
 *                     report_id:
 *                       type: string
 *                     reportType:
 *                       type: string
 *                     totalEmployees:
 *                       type: integer
 *                     totalHours:
 *                       type: number
 *                     totalOvertimeHours:
 *                       type: number
 *                     averageAttendance:
 *                       type: number
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
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
router.get('/reports', protect, hrOrClientAdmin, attendanceController.generateAttendanceReports.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/reports:
 *   post:
 *     summary: Generate custom attendance report
 *     tags: [Attendance]
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
 *               - reportType
 *             properties:
 *               organization_id:
 *                 type: integer
 *                 description: Organization ID
 *               reportType:
 *                 type: string
 *                 enum: [Summary, Detailed, Overtime, Absence, Late Arrivals]
 *                 description: Type of attendance report
 *               dateFrom:
 *                 type: string
 *                 format: date
 *                 description: Report start date
 *               dateTo:
 *                 type: string
 *                 format: date
 *                 description: Report end date
 *               employeeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific employee IDs to include
 *               department:
 *                 type: string
 *                 description: Filter by department
 *               format:
 *                 type: string
 *                 enum: [JSON, PDF, Excel]
 *                 default: JSON
 *                 description: Report format
 *               includeDetails:
 *                 type: boolean
 *                 default: false
 *                 description: Include detailed breakdown
 *     responses:
 *       200:
 *         description: Attendance report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 report:
 *                   type: object
 *                   properties:
 *                     report_id:
 *                       type: string
 *                     reportType:
 *                       type: string
 *                     totalEmployees:
 *                       type: integer
 *                     totalHours:
 *                       type: number
 *                     totalOvertimeHours:
 *                       type: number
 *                     averageAttendance:
 *                       type: number
 *                     generatedAt:
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
router.post('/reports', protect, hrOrClientAdmin, attendanceController.generateAttendanceReports.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/reports/{id}:
 *   get:
 *     summary: Get attendance report by ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Attendance report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report_id:
 *                   type: string
 *                 reportType:
 *                   type: string
 *                 organization_id:
 *                   type: integer
 *                 dateFrom:
 *                   type: string
 *                   format: date
 *                 dateTo:
 *                   type: string
 *                   format: date
 *                 totalEmployees:
 *                   type: integer
 *                 totalHours:
 *                   type: number
 *                 totalOvertimeHours:
 *                   type: number
 *                 averageAttendance:
 *                   type: number
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                 data:
 *                   type: object
 *                   description: Report data
 *       404:
 *         description: Report not found
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
router.get('/reports/:id', protect, hrOrClientAdmin, attendanceController.getAttendanceReport.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/reports/{id}/download:
 *   get:
 *     summary: Download attendance report
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [PDF, Excel, CSV]
 *           default: PDF
 *         description: Download format
 *     responses:
 *       200:
 *         description: Report downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Report not found
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
router.get('/reports/:id/download', protect, hrOrClientAdmin, attendanceController.downloadAttendanceReport.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/employee/{employeeId}:
 *   get:
 *     summary: Get employee attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for attendance records
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for attendance records
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Present, Absent, Late, Half Day, On Leave, Holiday, Weekend]
 *         description: Filter by attendance status
 *     responses:
 *       200:
 *         description: Employee attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AttendanceRecord'
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
router.get('/employee/:employeeId', protect, hrOrEmployee, attendanceController.getEmployeeAttendance.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/record/{id}:
 *   get:
 *     summary: Get attendance record by ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     responses:
 *       200:
 *         description: Attendance record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceRecord'
 *       404:
 *         description: Attendance record not found
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
router.get('/record/:id', protect, hrOrEmployee, attendanceController.getAttendanceRecord.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/record/{id}:
 *   put:
 *     summary: Update attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clockIn:
 *                 type: object
 *                 properties:
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   notes:
 *                     type: string
 *               clockOut:
 *                 type: object
 *                 properties:
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   notes:
 *                     type: string
 *               status:
 *                 type: string
 *                 enum: [Present, Absent, Late, Half Day, On Leave, Holiday, Weekend]
 *               notes:
 *                 type: string
 *                 description: General notes
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 attendanceRecord:
 *                   $ref: '#/components/schemas/AttendanceRecord'
 *       404:
 *         description: Attendance record not found
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
router.put('/record/:id', protect, hrOrClientAdmin, attendanceController.updateAttendanceRecord.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/record/{id}/approve:
 *   put:
 *     summary: Approve attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *                 description: Whether to approve or reject
 *               notes:
 *                 type: string
 *                 description: Approval notes
 *               approvedBy:
 *                 type: string
 *                 description: User who approved
 *     responses:
 *       200:
 *         description: Attendance record approval updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 attendanceRecord:
 *                   $ref: '#/components/schemas/AttendanceRecord'
 *       404:
 *         description: Attendance record not found
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
router.put('/record/:id/approve', protect, hrOrClientAdmin, attendanceController.approveAttendanceRecord.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/trends:
 *   get:
 *     summary: Get attendance trends
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organization_id
 *         schema:
 *           type: integer
 *         description: Organization ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7days, 30days, 90days, 1year]
 *           default: 30days
 *         description: Time period for trends
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: Attendance trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trends:
 *                   type: object
 *                   properties:
 *                     averageAttendance:
 *                       type: number
 *                     attendanceRate:
 *                       type: number
 *                     lateArrivals:
 *                       type: number
 *                     overtimeHours:
 *                       type: number
 *                     dailyTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           attendanceRate:
 *                             type: number
 *                           totalHours:
 *                             type: number
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
router.get('/trends', protect, hrOrClientAdmin, attendanceController.getAttendanceTrends.bind(attendanceController));

/**
 * @swagger
 * /api/attendance/summary/today:
 *   get:
 *     summary: Get today's attendance summary
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organization_id
 *         schema:
 *           type: integer
 *         description: Organization ID
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: Today's attendance summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     totalEmployees:
 *                       type: integer
 *                     presentEmployees:
 *                       type: integer
 *                     absentEmployees:
 *                       type: integer
 *                     lateEmployees:
 *                       type: integer
 *                     onLeaveEmployees:
 *                       type: integer
 *                     attendanceRate:
 *                       type: number
 *                     totalHoursWorked:
 *                       type: number
 *                     totalOvertimeHours:
 *                       type: number
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
router.get('/summary/today', protect, hrOrClientAdmin, attendanceController.getTodayAttendanceSummary.bind(attendanceController));

module.exports = router;
