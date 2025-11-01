const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const expenseController = require('./expense.controller');

const router = express.Router();

// Define Role-Based Authorizations
const employeeOnly = authorize(['Employee', 'Super Admin', 'Client Admin', 'HR Account Manager']);
const employeeOrManager = authorize(['Employee', 'Super Admin', 'Client Admin', 'HR Account Manager', 'Manager']);
const managerOrFinance = authorize(['Manager', 'Finance', 'Super Admin', 'Client Admin']);
const adminOnly = authorize(['Super Admin', 'Client Admin']);

// ==================== CLAIM MANAGEMENT ROUTES ====================

/**
 * @swagger
 * /api/expense/claim/create:
 *   post:
 *     summary: Submit new expense claim
 *     tags: [Expense Claims]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - claimDate
 *               - expenses
 *             properties:
 *               title:
 *                 type: string
 *                 description: Claim title
 *               description:
 *                 type: string
 *                 description: Claim description
 *               category:
 *                 type: string
 *                 enum: [Travel, Meals, Accommodation, Transport, Office Supplies, Training, Software, Communication, Marketing, Professional Services, Utilities, Healthcare, Other]
 *               subCategory:
 *                 type: string
 *               claimDate:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Urgent]
 *                 default: Medium
 *               expenses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - description
 *                     - category
 *                     - expenseDate
 *                     - amount
 *                   properties:
 *                     description:
 *                       type: string
 *                     category:
 *                       type: string
 *                     expenseDate:
 *                       type: string
 *                       format: date
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                       enum: [USD, INR, EUR, GBP, CAD, AUD, JPY]
 *                       default: USD
 *                     receipt:
 *                       type: object
 *                       properties:
 *                         receipt_id:
 *                           type: integer
 *                     isReceiptAttached:
 *                       type: boolean
 *                       default: false
 *                     vendor:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         address:
 *                           type: string
 *                     project:
 *                       type: string
 *                     customer:
 *                       type: string
 *                     notes:
 *                       type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense claim created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/claim/create', protect, employeeOnly, expenseController.createClaim.bind(expenseController));

/**
 * @swagger
 * /api/expense/claim/update/{id}:
 *   put:
 *     summary: Update claim (before approval)
 *     tags: [Expense Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Claim ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               expenses:
 *                 type: array
 *                 items:
 *                   type: object
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Claim updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/claim/update/:id', protect, employeeOnly, expenseController.updateClaim.bind(expenseController));

/**
 * @swagger
 * /api/expense/claim/delete/{id}:
 *   delete:
 *     summary: Withdraw claim
 *     tags: [Expense Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Claim ID
 *     responses:
 *       200:
 *         description: Claim deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/claim/delete/:id', protect, employeeOnly, expenseController.deleteClaim.bind(expenseController));

/**
 * @swagger
 * /api/expense/claim/list:
 *   get:
 *     summary: View submitted claims
 *     tags: [Expense Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Submitted, Under Review, Approved, Rejected, Forwarded, Reimbursed, Cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Urgent]
 *         description: Filter by priority
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
 *         name: employee_id
 *         schema:
 *           type: integer
 *         description: Filter by employee
 *     responses:
 *       200:
 *         description: Claims retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/claim/list', protect, employeeOrManager, expenseController.listClaims.bind(expenseController));

/**
 * @swagger
 * /api/expense/claim/{id}:
 *   get:
 *     summary: Get detailed expense claim info
 *     tags: [Expense Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Claim ID
 *     responses:
 *       200:
 *         description: Claim details retrieved successfully
 *       404:
 *         description: Claim not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/claim/:id', protect, employeeOrManager, expenseController.getClaimById.bind(expenseController));

// ==================== RECEIPT ROUTES ====================

/**
 * @swagger
 * /api/expense/receipts/upload:
 *   post:
 *     summary: Upload receipt (PDF, JPG, PNG)
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               claim_id:
 *                 type: integer
 *               expense_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Receipt uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/receipts/upload', protect, employeeOnly, expenseController.uploadReceipt.bind(expenseController));

/**
 * @swagger
 * /api/expense/receipts/ocr:
 *   post:
 *     summary: OCR scanning and data extraction
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiptId
 *             properties:
 *               receiptId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: OCR processing completed
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/receipts/ocr', protect, expenseController.processOCR.bind(expenseController));

/**
 * @swagger
 * /api/expense/receipts/delete/{id}:
 *   delete:
 *     summary: Delete uploaded receipt
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Receipt ID
 *     responses:
 *       200:
 *         description: Receipt deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/receipts/delete/:id', protect, employeeOnly, expenseController.deleteReceipt.bind(expenseController));

// ==================== APPROVAL ROUTES ====================

/**
 * @swagger
 * /api/expense/approve/{id}:
 *   put:
 *     summary: Approve claim
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Claim ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Claim approved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.put('/approve/:id', protect, managerOrFinance, expenseController.approveClaim.bind(expenseController));

/**
 * @swagger
 * /api/expense/reject/{id}:
 *   put:
 *     summary: Reject claim
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Claim ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comments
 *             properties:
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Claim rejected successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.put('/reject/:id', protect, managerOrFinance, expenseController.rejectClaim.bind(expenseController));

/**
 * @swagger
 * /api/expense/forward/{id}:
 *   put:
 *     summary: Forward claim to next level
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Claim ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Claim forwarded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.put('/forward/:id', protect, managerOrFinance, expenseController.forwardClaim.bind(expenseController));

// ==================== PAYOUT ROUTES ====================

/**
 * @swagger
 * /api/expense/payout/{id}:
 *   post:
 *     summary: Mark claim reimbursed via payroll
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Claim ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reimbursementMethod
 *             properties:
 *               reimbursementMethod:
 *                 type: string
 *                 enum: [Payroll, Bank Transfer, Cash, Check, Other]
 *               reimbursementReference:
 *                 type: string
 *               paymentStatus:
 *                 type: string
 *                 enum: [Pending, Processing, Paid, Failed]
 *                 default: Processing
 *     responses:
 *       200:
 *         description: Payout processed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/payout/:id', protect, managerOrFinance, expenseController.processPayout.bind(expenseController));

// ==================== REPORT ROUTES ====================

/**
 * @swagger
 * /api/expense/reports/monthly:
 *   get:
 *     summary: Monthly expense summary
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month (defaults to current month)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year (defaults to current year)
 *     responses:
 *       200:
 *         description: Monthly report retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/reports/monthly', protect, managerOrFinance, expenseController.getMonthlyExpenseReport.bind(expenseController));

/**
 * @swagger
 * /api/expense/reports/category:
 *   get:
 *     summary: Category-wise expense analytics
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Approved, Reimbursed, All]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Category report retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/reports/category', protect, managerOrFinance, expenseController.getCategoryExpenseReport.bind(expenseController));

// ==================== POLICY ROUTES ====================

/**
 * @swagger
 * /api/expense/policy/list:
 *   get:
 *     summary: List reimbursement policies
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
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
router.get('/policy/list', protect, expenseController.listPolicies.bind(expenseController));

/**
 * @swagger
 * /api/expense/policy/update:
 *   put:
 *     summary: Update claim limits or policy
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - policyId
 *             properties:
 *               policyId:
 *                 type: integer
 *               policyName:
 *                 type: string
 *               description:
 *                 type: string
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: string
 *                     maxDailyLimit:
 *                       type: number
 *                     maxMonthlyLimit:
 *                       type: number
 *                     maxAnnualLimit:
 *                       type: number
 *                     requiresApproval:
 *                       type: boolean
 *                     approvalThreshold:
 *                       type: number
 *                     requiresReceipt:
 *                       type: boolean
 *                     receiptThreshold:
 *                       type: number
 *               generalRules:
 *                 type: object
 *                 properties:
 *                   maxClaimAmount:
 *                     type: number
 *                   minClaimAmount:
 *                     type: number
 *                   claimSubmissionDeadline:
 *                     type: number
 *                   advanceRequestAllowed:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Policy updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.put('/policy/update', protect, adminOnly, expenseController.updatePolicy.bind(expenseController));

module.exports = router;
