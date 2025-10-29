const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const healthcareController = require('./healthcare.controller');

const router = express.Router();

// Define Role-Based Authorizations
const superAdminOrClientAdmin = authorize(['Super Admin', 'Client Admin']);
const superAdminOrClientAdminOrHR = authorize(['Super Admin', 'Client Admin', 'HR Account Manager']);
const hrOrAdmin = authorize(['HR Account Manager', 'Super Admin', 'Client Admin']);
const complianceOfficer = authorize(['Compliance Officer', 'Super Admin', 'Client Admin']);
const allEmployees = authorize(['Super Admin', 'Client Admin', 'HR Account Manager', 'Employee', 'Nurse', 'Doctor', 'Technician', 'Administrator']);

// ==================== RECRUITMENT ROUTES ====================

/**
 * @swagger
 * /api/healthcare/recruitment/create:
 *   post:
 *     summary: Add a new medical/clinical staff recruitment record
 *     tags: [Healthcare Recruitment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - position
 *               - department
 *               - specialty
 *               - employmentType
 *               - shiftType
 *               - experienceLevel
 *               - salaryRange
 *               - description
 *             properties:
 *               position:
 *                 type: string
 *                 description: Job position title
 *               department:
 *                 type: string
 *                 description: Department name
 *               specialty:
 *                 type: string
 *                 description: Medical specialty
 *               employmentType:
 *                 type: string
 *                 enum: [Full-time, Part-time, Contract, Per Diem, Locum Tenens]
 *               shiftType:
 *                 type: string
 *                 enum: [Day, Night, Rotating, On-call, Weekend]
 *               requiredCredentials:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     credentialType:
 *                       type: string
 *                     isRequired:
 *                       type: boolean
 *               experienceLevel:
 *                 type: string
 *                 enum: [Entry Level, Mid Level, Senior Level, Expert]
 *               salaryRange:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                   max:
 *                     type: number
 *                   currency:
 *                     type: string
 *                     enum: [USD, INR, EUR, GBP, CAD, AUD, JPY]
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *                 description: Job description
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 default: Medium
 *               applicationDeadline:
 *                 type: string
 *                 format: date
 *               complianceNotes:
 *                 type: string
 *               hipaaTrainingRequired:
 *                 type: boolean
 *                 default: true
 *               backgroundCheckRequired:
 *                 type: boolean
 *                 default: true
 *               drugTestRequired:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Healthcare recruitment created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/recruitment/create', protect, superAdminOrClientAdminOrHR, healthcareController.createRecruitment.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/recruitment/list:
 *   get:
 *     summary: List all ongoing or completed recruitments
 *     tags: [Healthcare Recruitment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, Closed, On Hold, Draft, Filled]
 *         description: Filter by recruitment status
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Filter by medical specialty
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: List of recruitments retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/recruitment/list', protect, superAdminOrClientAdminOrHR, healthcareController.listRecruitments.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/recruitment/{id}:
 *   get:
 *     summary: View details of a specific recruitment
 *     tags: [Healthcare Recruitment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recruitment ID
 *     responses:
 *       200:
 *         description: Recruitment details retrieved successfully
 *       404:
 *         description: Recruitment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/recruitment/:id', protect, superAdminOrClientAdminOrHR, healthcareController.getRecruitmentById.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/recruitment/update/{id}:
 *   put:
 *     summary: Update recruitment record
 *     tags: [Healthcare Recruitment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recruitment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               position:
 *                 type: string
 *               department:
 *                 type: string
 *               specialty:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Open, Closed, On Hold, Draft, Filled]
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *               description:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *               complianceNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recruitment updated successfully
 *       404:
 *         description: Recruitment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.put('/recruitment/update/:id', protect, superAdminOrClientAdminOrHR, healthcareController.updateRecruitment.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/recruitment/delete/{id}:
 *   delete:
 *     summary: Remove recruitment record
 *     tags: [Healthcare Recruitment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recruitment ID
 *     responses:
 *       200:
 *         description: Recruitment deleted successfully
 *       404:
 *         description: Recruitment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.delete('/recruitment/delete/:id', protect, superAdminOrClientAdmin, healthcareController.deleteRecruitment.bind(healthcareController));

// ==================== CREDENTIALS ROUTES ====================

/**
 * @swagger
 * /api/healthcare/credentials/add:
 *   post:
 *     summary: Add license or credential record for staff
 *     tags: [Healthcare Credentials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - credentialType
 *               - credentialName
 *               - issuingAuthority
 *               - credentialNumber
 *               - issueDate
 *               - expirationDate
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 description: Employee ID
 *               credentialType:
 *                 type: string
 *                 enum: [Medical License, Nursing License, Specialty Certification, DEA License, Board Certification, CPR Certification, ACLS Certification, PALS Certification, BLS Certification, HIPAA Training, Other]
 *               credentialName:
 *                 type: string
 *                 description: Name of the credential
 *               issuingAuthority:
 *                 type: string
 *                 description: Issuing authority
 *               credentialNumber:
 *                 type: string
 *                 description: Credential number
 *               issueDate:
 *                 type: string
 *                 format: date
 *               expirationDate:
 *                 type: string
 *                 format: date
 *               renewalDate:
 *                 type: string
 *                 format: date
 *               isRequired:
 *                 type: boolean
 *                 default: true
 *               documentPath:
 *                 type: string
 *                 description: Path to credential document
 *               notes:
 *                 type: string
 *               autoRenewal:
 *                 type: boolean
 *                 default: false
 *               reminderDays:
 *                 type: integer
 *                 default: 30
 *     responses:
 *       201:
 *         description: Credential added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/credentials/add', protect, hrOrAdmin, healthcareController.addCredential.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/credentials/list:
 *   get:
 *     summary: View all credentials with expiration tracking
 *     tags: [Healthcare Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: credentialType
 *         schema:
 *           type: string
 *           enum: [Medical License, Nursing License, Specialty Certification, DEA License, Board Certification, CPR Certification, ACLS Certification, PALS Certification, BLS Certification, HIPAA Training, Other]
 *         description: Filter by credential type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Expired, Suspended, Revoked, Pending Renewal]
 *         description: Filter by credential status
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: integer
 *         description: Filter by employee ID
 *     responses:
 *       200:
 *         description: Credentials retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/credentials/list', protect, hrOrAdmin, healthcareController.listCredentials.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/credentials/renew/{id}:
 *   put:
 *     summary: Update or renew credential/license
 *     tags: [Healthcare Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Credential ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expirationDate:
 *                 type: string
 *                 format: date
 *               renewalDate:
 *                 type: string
 *                 format: date
 *               documentPath:
 *                 type: string
 *               notes:
 *                 type: string
 *               isVerified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Credential renewed successfully
 *       404:
 *         description: Credential not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.put('/credentials/renew/:id', protect, hrOrAdmin, healthcareController.renewCredential.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/credentials/notify-expiring:
 *   post:
 *     summary: Auto-notify for soon-to-expire licenses
 *     tags: [Healthcare Credentials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expiring credentials notification processed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/credentials/notify-expiring', protect, healthcareController.notifyExpiringCredentials.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/credentials/delete/{id}:
 *   delete:
 *     summary: Remove credential record
 *     tags: [Healthcare Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Credential ID
 *     responses:
 *       200:
 *         description: Credential deleted successfully
 *       404:
 *         description: Credential not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.delete('/credentials/delete/:id', protect, superAdminOrClientAdmin, healthcareController.deleteCredential.bind(healthcareController));

// ==================== SHIFTS ROUTES ====================

/**
 * @swagger
 * /api/healthcare/shifts/create:
 *   post:
 *     summary: Create new shift schedule
 *     tags: [Healthcare Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shiftName
 *               - shiftType
 *               - startTime
 *               - endTime
 *               - duration
 *               - workingDays
 *               - requiredStaffing
 *             properties:
 *               shiftName:
 *                 type: string
 *                 description: Name of the shift
 *               shiftType:
 *                 type: string
 *                 enum: [Day, Night, Evening, On-call, Weekend, Holiday]
 *               startTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Start time (HH:MM)
 *               endTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: End time (HH:MM)
 *               duration:
 *                 type: number
 *                 description: Duration in hours
 *               workingDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *               isRotating:
 *                 type: boolean
 *                 default: false
 *               rotationPattern:
 *                 type: string
 *               breakDuration:
 *                 type: number
 *                 default: 30
 *               overtimeRules:
 *                 type: object
 *                 properties:
 *                   dailyThreshold:
 *                     type: number
 *                     default: 8
 *                   weeklyThreshold:
 *                     type: number
 *                     default: 40
 *                   overtimeRate:
 *                     type: number
 *                     default: 1.5
 *                   doubleTimeRate:
 *                     type: number
 *                     default: 2.0
 *               requiredStaffing:
 *                 type: object
 *                 properties:
 *                   minimum:
 *                     type: number
 *                   maximum:
 *                     type: number
 *                   specialties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         specialty:
 *                           type: string
 *                         count:
 *                           type: number
 *               department_id:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Healthcare shift created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/shifts/create', protect, hrOrAdmin, healthcareController.createShift.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/shifts/assign:
 *   post:
 *     summary: Assign shifts to staff
 *     tags: [Healthcare Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shift_id
 *               - employee_id
 *               - assignedDate
 *               - startTime
 *               - endTime
 *             properties:
 *               shift_id:
 *                 type: integer
 *                 description: Shift ID
 *               employee_id:
 *                 type: integer
 *                 description: Employee ID
 *               assignedDate:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shift assigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/shifts/assign', protect, hrOrAdmin, healthcareController.assignShift.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/shifts/list:
 *   get:
 *     summary: List scheduled shifts
 *     tags: [Healthcare Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *         description: Filter by department ID
 *       - in: query
 *         name: shiftType
 *         schema:
 *           type: string
 *           enum: [Day, Night, Evening, On-call, Weekend, Holiday]
 *         description: Filter by shift type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Shifts retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/shifts/list', protect, hrOrAdmin, healthcareController.listShifts.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/shifts/payroll/calculate:
 *   post:
 *     summary: Calculate shift-based payroll
 *     tags: [Healthcare Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignmentId
 *             properties:
 *               assignmentId:
 *                 type: integer
 *                 description: Shift assignment ID
 *     responses:
 *       200:
 *         description: Shift payroll calculated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/shifts/payroll/calculate', protect, authorize(['Finance', 'Super Admin', 'Client Admin']), healthcareController.calculateShiftPayroll.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/shifts/logs:
 *   get:
 *     summary: Track attendance and shift logs
 *     tags: [Healthcare Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: integer
 *         description: Filter by employee ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Scheduled, Confirmed, Completed, Cancelled, No Show, Late]
 *         description: Filter by assignment status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: Shift logs retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/shifts/logs', protect, hrOrAdmin, healthcareController.getShiftLogs.bind(healthcareController));

// ==================== POLICIES ROUTES ====================

/**
 * @swagger
 * /api/healthcare/policy/upload:
 *   post:
 *     summary: Upload healthcare-specific HR policy
 *     tags: [Healthcare Policies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - policyName
 *               - policyType
 *               - effectiveDate
 *               - content
 *             properties:
 *               policyName:
 *                 type: string
 *                 description: Name of the policy
 *               policyType:
 *                 type: string
 *                 enum: [HIPAA Compliance, Patient Safety, Clinical Protocols, Emergency Procedures, Staff Training, Quality Assurance, Infection Control, Medication Management, Documentation Standards, Other]
 *               version:
 *                 type: string
 *                 default: '1.0'
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *               expirationDate:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 default: Medium
 *               content:
 *                 type: string
 *                 description: Policy content
 *               summary:
 *                 type: string
 *                 description: Policy summary
 *               applicableRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [All, Super Admin, Client Admin, HR Account Manager, Employee, Nurse, Doctor, Technician, Administrator]
 *               applicableDepartments:
 *                 type: array
 *                 items:
 *                   type: string
 *               documentPath:
 *                 type: string
 *                 description: Path to policy document
 *               approvalRequired:
 *                 type: boolean
 *                 default: true
 *               complianceNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Healthcare policy uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/policy/upload', protect, superAdminOrClientAdmin, healthcareController.uploadPolicy.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/policy/list:
 *   get:
 *     summary: List all policies
 *     tags: [Healthcare Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: policyType
 *         schema:
 *           type: string
 *           enum: [HIPAA Compliance, Patient Safety, Clinical Protocols, Emergency Procedures, Staff Training, Quality Assurance, Infection Control, Medication Management, Documentation Standards, Other]
 *         description: Filter by policy type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Active, Archived, Under Review, Superseded]
 *         description: Filter by policy status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: Policies retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/policy/list', protect, allEmployees, healthcareController.listPolicies.bind(healthcareController));

// ==================== ONBOARDING ROUTES ====================

/**
 * @swagger
 * /api/healthcare/onboarding/workflow/create:
 *   post:
 *     summary: Define onboarding workflow for clinical staff
 *     tags: [Healthcare Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workflowName
 *               - department
 *               - position
 *               - steps
 *               - totalEstimatedDays
 *             properties:
 *               workflowName:
 *                 type: string
 *                 description: Name of the workflow
 *               department:
 *                 type: string
 *                 description: Department name
 *               position:
 *                 type: string
 *                 description: Position name
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - stepNumber
 *                     - stepName
 *                     - assignedTo
 *                   properties:
 *                     stepNumber:
 *                       type: integer
 *                     stepName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isRequired:
 *                       type: boolean
 *                       default: true
 *                     estimatedDays:
 *                       type: integer
 *                       default: 1
 *                     assignedTo:
 *                       type: string
 *                       enum: [HR, Manager, IT, Compliance, Employee, System]
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: string
 *                     prerequisites:
 *                       type: array
 *                       items:
 *                         type: string
 *               totalEstimatedDays:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Onboarding workflow created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/onboarding/workflow/create', protect, hrOrAdmin, healthcareController.createOnboardingWorkflow.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/onboarding/status/{employeeId}:
 *   get:
 *     summary: Track onboarding status
 *     tags: [Healthcare Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Onboarding status retrieved successfully
 *       404:
 *         description: Onboarding status not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/onboarding/status/:employeeId', protect, hrOrAdmin, healthcareController.getOnboardingStatus.bind(healthcareController));

// ==================== ROLES ROUTES ====================

/**
 * @swagger
 * /api/healthcare/roles/create:
 *   post:
 *     summary: Create healthcare-specific access roles
 *     tags: [Healthcare Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleName
 *               - roleType
 *               - department
 *             properties:
 *               roleName:
 *                 type: string
 *                 description: Name of the role
 *               roleType:
 *                 type: string
 *                 enum: [Clinical, Administrative, Support, Management, Compliance]
 *               department:
 *                 type: string
 *                 description: Department name
 *               description:
 *                 type: string
 *               permissions:
 *                 type: object
 *                 properties:
 *                   patientData:
 *                     type: object
 *                     properties:
 *                       read:
 *                         type: boolean
 *                       write:
 *                         type: boolean
 *                       delete:
 *                         type: boolean
 *                   medicalRecords:
 *                     type: object
 *                     properties:
 *                       read:
 *                         type: boolean
 *                       write:
 *                         type: boolean
 *                       delete:
 *                         type: boolean
 *                   scheduling:
 *                     type: object
 *                     properties:
 *                       read:
 *                         type: boolean
 *                       write:
 *                         type: boolean
 *                       delete:
 *                         type: boolean
 *                   billing:
 *                     type: object
 *                     properties:
 *                       read:
 *                         type: boolean
 *                       write:
 *                         type: boolean
 *                       delete:
 *                         type: boolean
 *                   reporting:
 *                     type: object
 *                     properties:
 *                       read:
 *                         type: boolean
 *                       write:
 *                         type: boolean
 *                       export:
 *                         type: boolean
 *                   compliance:
 *                     type: object
 *                     properties:
 *                       read:
 *                         type: boolean
 *                       write:
 *                         type: boolean
 *                       audit:
 *                         type: boolean
 *               hipaaAccess:
 *                 type: string
 *                 enum: [None, Limited, Full]
 *                 default: None
 *               requiredCredentials:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     credentialType:
 *                       type: string
 *                     isRequired:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Healthcare role created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/roles/create', protect, superAdminOrClientAdmin, healthcareController.createHealthcareRole.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/roles/assign:
 *   post:
 *     summary: Assign access permissions to clinical users
 *     tags: [Healthcare Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - role_id
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 description: Employee ID
 *               role_id:
 *                 type: integer
 *                 description: Healthcare role ID
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *               expirationDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Healthcare role assigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/roles/assign', protect, superAdminOrClientAdmin, healthcareController.assignHealthcareRole.bind(healthcareController));

// ==================== AUDIT ROUTES ====================

/**
 * @swagger
 * /api/healthcare/audit/logs:
 *   get:
 *     summary: Retrieve patient-data compliance audit logs
 *     tags: [Healthcare Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Patient Data Access, Medical Records, User Authentication, System Configuration, Compliance, Security, Data Export, Data Import, Other]
 *         description: Filter by audit category
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         description: Filter by severity level
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Limit number of results
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/audit/logs', protect, complianceOfficer, healthcareController.getAuditLogs.bind(healthcareController));

/**
 * @swagger
 * /api/healthcare/audit/export:
 *   get:
 *     summary: Export audit logs for external compliance
 *     tags: [Healthcare Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Patient Data Access, Medical Records, User Authentication, System Configuration, Compliance, Security, Data Export, Data Import, Other]
 *         description: Filter by audit category
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         description: Filter by severity level
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [JSON, CSV, PDF]
 *           default: JSON
 *         description: Export format
 *     responses:
 *       200:
 *         description: Audit logs exported successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/audit/export', protect, superAdminOrClientAdmin, healthcareController.exportAuditLogs.bind(healthcareController));

module.exports = router;
