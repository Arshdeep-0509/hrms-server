const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const financeController = require('./finance.controller');

const router = express.Router();

// Define Role-Based Authorizations
const bookkeeperOnly = authorize(['Bookkeeper']);
const bookkeeperOrSuperAdmin = authorize(['Bookkeeper', 'Super Admin']);
const bookkeeperOrClientAdmin = authorize(['Bookkeeper', 'Client Admin']);

// 1. List transactions (filter by type/date/org)
// GET /api/finance/transactions
router.get('/transactions', protect, bookkeeperOrSuperAdmin, financeController.listTransactions.bind(financeController));

// 2. Add new transaction
// POST /api/finance/transactions
router.post('/transactions', protect, bookkeeperOnly, financeController.createTransaction.bind(financeController));

// 3. Update transaction
// PUT /api/finance/transactions/:transaction_id
router.put('/transactions/:transaction_id', protect, bookkeeperOnly, financeController.updateTransaction.bind(financeController));

// 4. Delete transaction
// DELETE /api/finance/transactions/:transaction_id
router.delete('/transactions/:transaction_id', protect, bookkeeperOnly, financeController.deleteTransaction.bind(financeController));

// 5. Generate financial reports (Balance Sheet, P&L)
// GET /api/finance/reports
router.get('/reports', protect, bookkeeperOrClientAdmin, financeController.generateReports.bind(financeController));

// 6. Run bank/credit card reconciliation
// POST /api/finance/reconciliation
router.post('/reconciliation', protect, bookkeeperOnly, financeController.runReconciliation.bind(financeController));

// 7. Create budget/forecast
// POST /api/finance/budget
router.post('/budget', protect, bookkeeperOrClientAdmin, financeController.createBudget.bind(financeController));

module.exports = router;

