const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const financeController = require('./finance.controller');

const router = express.Router();

// Define Role-Based Authorizations
const bookkeeperOnly = authorize(['Bookkeeper']);
const bookkeeperOrSuperAdmin = authorize(['Bookkeeper', 'Super Admin']);
const bookkeeperOrClientAdmin = authorize(['Bookkeeper', 'Client Admin']);

// Finance Management Routes

/**
 * @swagger
 * /api/finance/transactions:
 *   get:
 *     summary: List all financial transactions
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Income, Expense, Transfer, Refund]
 *         description: Filter by transaction type
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter transactions from date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter transactions to date
 *       - in: query
 *         name: organization_id
 *         schema:
 *           type: integer
 *         description: Filter by organization ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by transaction category
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
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
 * /api/finance/transactions/{transaction_id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transaction_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
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
router.get('/transactions/:transaction_id', protect, bookkeeperOrSuperAdmin, financeController.getTransaction.bind(financeController));

router.get('/transactions', protect, bookkeeperOrSuperAdmin, financeController.listTransactions.bind(financeController));

/**
 * @swagger
 * /api/finance/transactions:
 *   post:
 *     summary: Create new financial transaction
 *     tags: [Finance]
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
 *               - type
 *               - amount
 *               - description
 *               - category
 *             properties:
 *               organization_id:
 *                 type: integer
 *                 description: Organization ID
 *               type:
 *                 type: string
 *                 enum: [Income, Expense, Transfer, Refund]
 *                 description: Transaction type
 *               amount:
 *                 type: number
 *                 description: Transaction amount
 *               currency:
 *                 type: string
 *                 enum: [USD, INR, EUR, GBP, CAD, AUD, JPY]
 *                 default: USD
 *                 description: Currency
 *               description:
 *                 type: string
 *                 description: Transaction description
 *               category:
 *                 type: string
 *                 description: Transaction category
 *               reference:
 *                 type: string
 *                 description: Reference number or ID
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Transaction date
 *               account_id:
 *                 type: integer
 *                 description: Account ID
 *               vendor_id:
 *                 type: integer
 *                 description: Vendor ID (for expenses)
 *               customer_id:
 *                 type: integer
 *                 description: Customer ID (for income)
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
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
router.post('/transactions', protect, bookkeeperOnly, financeController.createTransaction.bind(financeController));

/**
 * @swagger
 * /api/finance/transactions/{transaction_id}:
 *   put:
 *     summary: Update financial transaction
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transaction_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Income, Expense, Transfer, Refund]
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [USD, INR, EUR, GBP, CAD, AUD, JPY]
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               reference:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               account_id:
 *                 type: integer
 *               vendor_id:
 *                 type: integer
 *               customer_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
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
router.put('/transactions/:transaction_id', protect, bookkeeperOnly, financeController.updateTransaction.bind(financeController));

/**
 * @swagger
 * /api/finance/transactions/{transaction_id}:
 *   delete:
 *     summary: Delete financial transaction
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transaction_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Transaction not found
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
router.delete('/transactions/:transaction_id', protect, bookkeeperOnly, financeController.deleteTransaction.bind(financeController));

/**
 * @swagger
 * /api/finance/reports:
 *   get:
 *     summary: Generate financial reports
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [Balance Sheet, Profit and Loss, Cash Flow, Trial Balance]
 *         description: Type of financial report
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
 *         name: organization_id
 *         schema:
 *           type: integer
 *         description: Organization ID
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [JSON, PDF, Excel]
 *           default: JSON
 *         description: Report format
 *     responses:
 *       200:
 *         description: Financial report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 report:
 *                   type: object
 *                   description: Financial report data
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
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
router.get('/reports', protect, bookkeeperOrClientAdmin, financeController.generateReports.bind(financeController));

/**
 * @swagger
 * /api/finance/reconciliation:
 *   post:
 *     summary: Run bank/credit card reconciliation
 *     tags: [Finance]
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
 *               - account_id
 *               - reconciliationDate
 *             properties:
 *               organization_id:
 *                 type: integer
 *                 description: Organization ID
 *               account_id:
 *                 type: integer
 *                 description: Bank/Credit card account ID
 *               reconciliationDate:
 *                 type: string
 *                 format: date
 *                 description: Reconciliation date
 *               statementBalance:
 *                 type: number
 *                 description: Statement balance
 *               clearedTransactions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of cleared transaction IDs
 *     responses:
 *       200:
 *         description: Reconciliation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reconciliation:
 *                   type: object
 *                   properties:
 *                     reconciledBalance:
 *                       type: number
 *                     difference:
 *                       type: number
 *                     status:
 *                       type: string
 *                       enum: [Reconciled, Unreconciled, Partial]
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
router.post('/reconciliation', protect, bookkeeperOnly, financeController.runReconciliation.bind(financeController));

/**
 * @swagger
 * /api/finance/budget:
 *   post:
 *     summary: Create budget/forecast
 *     tags: [Finance]
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
 *               - budgetName
 *               - budgetType
 *               - period
 *               - categories
 *             properties:
 *               organization_id:
 *                 type: integer
 *                 description: Organization ID
 *               budgetName:
 *                 type: string
 *                 description: Budget name
 *               budgetType:
 *                 type: string
 *                 enum: [Annual, Quarterly, Monthly, Project]
 *                 description: Budget type
 *               period:
 *                 type: object
 *                 required:
 *                   - startDate
 *                   - endDate
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: string
 *                     budgetedAmount:
 *                       type: number
 *                     actualAmount:
 *                       type: number
 *               notes:
 *                 type: string
 *                 description: Budget notes
 *     responses:
 *       201:
 *         description: Budget created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 budget:
 *                   type: object
 *                   properties:
 *                     budget_id:
 *                       type: integer
 *                     budgetName:
 *                       type: string
 *                     budgetType:
 *                       type: string
 *                     totalBudgeted:
 *                       type: number
 *                     totalActual:
 *                       type: number
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
router.post('/budget', protect, bookkeeperOrClientAdmin, financeController.createBudget.bind(financeController));

module.exports = router;

