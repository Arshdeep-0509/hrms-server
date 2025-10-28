const financeService = require('./finance.service');

class FinanceController {
  /**
   * List transactions with filters
   * Accessible by: Bookkeeper / Super Admin
   */
  async listTransactions(req, res) {
    try {
      const transactions = await financeService.listTransactions(req.query, req.user);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during transaction retrieval' });
    }
  }

  /**
   * Get transaction by ID
   * Accessible by: Bookkeeper / Super Admin
   */
  async getTransaction(req, res) {
    try {
      const transactionId = parseInt(req.params.transaction_id);
      if (isNaN(transactionId)) {
        return res.status(400).json({ message: 'Invalid transaction ID' });
      }
      const transaction = await financeService.getTransaction(transactionId, req.user);
      res.json(transaction);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during transaction retrieval' });
    }
  }

  /**
   * Create new transaction
   * Accessible by: Bookkeeper
   */
  async createTransaction(req, res) {
    try {
      const result = await financeService.createTransaction(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating transaction:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during transaction creation' });
    }
  }

  /**
   * Update transaction
   * Accessible by: Bookkeeper
   */
  async updateTransaction(req, res) {
    try {
      const transactionId = parseInt(req.params.transaction_id);
      if (isNaN(transactionId)) {
        return res.status(400).json({ message: 'Invalid transaction ID' });
      }
      const result = await financeService.updateTransaction(transactionId, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error updating transaction:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during transaction update' });
    }
  }

  /**
   * Delete transaction
   * Accessible by: Bookkeeper
   */
  async deleteTransaction(req, res) {
    try {
      const transactionId = parseInt(req.params.transaction_id);
      if (isNaN(transactionId)) {
        return res.status(400).json({ message: 'Invalid transaction ID' });
      }
      const result = await financeService.deleteTransaction(transactionId, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during transaction deletion' });
    }
  }

  /**
   * Generate financial reports (Balance Sheet, P&L)
   * Accessible by: Bookkeeper / Client Admin
   */
  async generateReports(req, res) {
    try {
      const result = await financeService.generateReports(req.query, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error generating reports:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during report generation' });
    }
  }

  /**
   * Run bank/credit card reconciliation
   * Accessible by: Bookkeeper
   */
  async runReconciliation(req, res) {
    try {
      const result = await financeService.runReconciliation(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error running reconciliation:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during reconciliation' });
    }
  }

  /**
   * Create budget/forecast
   * Accessible by: Bookkeeper / Client Admin
   */
  async createBudget(req, res) {
    try {
      const result = await financeService.createBudget(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating budget:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during budget creation' });
    }
  }
}

module.exports = new FinanceController();

