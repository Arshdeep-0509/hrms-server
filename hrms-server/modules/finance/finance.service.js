const { Transaction, Budget, Reconciliation } = require('./finance.schema');
const Organization = require('../organization/organization.schema');

class FinanceService {
  /**
   * List transactions with filters
   * @param {Object} filters - Filter options (type, date, organization)
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} Array of transactions
   */
  async listTransactions(filters, user) {
    const query = {};

    // If user is not Super Admin, filter by their organization
    if (user.role !== 'Super Admin') {
      const organization = await Organization.findOne({ clientAdmin: user.id });
      if (organization) {
        query.organization = organization._id;
      } else {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
    } else if (filters.organization) {
      query.organization = filters.organization;
    }

    // Apply filters
    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.date.$lte = new Date(filters.endDate);
      }
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const transactions = await Transaction.find(query)
      .populate('organization', 'name')
      .populate('createdBy', 'name email')
      .populate('reconciledBy', 'name email')
      .sort({ date: -1, createdAt: -1 });

    return transactions;
  }

  /**
   * Get transaction by numeric ID
   */
  async getTransaction(transactionId, user) {
    const transaction = await Transaction.findOne({ transaction_id: transactionId })
      .populate('organization', 'name')
      .populate('createdBy', 'name email')
      .populate('reconciledBy', 'name email');

    if (!transaction) {
      throw { statusCode: 404, message: 'Transaction not found.' };
    }

    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || transaction.organization._id.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this transaction.' };
      }
    }

    return transaction;
  }

  /**
   * Create new transaction
   * @param {Object} transactionData - Transaction data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Created transaction
   */
  async createTransaction(transactionData, user) {
    const { organization, organization_id, transaction_id, employee_id, department_id, type, category, amount, description, date, paymentMethod, reference } = transactionData;

    // Validate organization access
    let organizationId = organization;
    let organizationNumericId = organization_id;
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org) {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
      organizationId = org._id;
      organizationNumericId = org.organization_id;
    } else {
      const org = await Organization.findById(organization);
      if (!org) {
        throw { statusCode: 404, message: 'Organization not found.' };
      }
      organizationNumericId = org.organization_id;
    }

    if (!transaction_id) {
      throw { statusCode: 400, message: 'Transaction ID is required.' };
    }

    // Check if transaction_id already exists
    const existingTransaction = await Transaction.findOne({ transaction_id });
    if (existingTransaction) {
      throw { statusCode: 400, message: 'Transaction ID already exists.' };
    }

    const transaction = await Transaction.create({
      organization: organizationId,
      organization_id: organizationNumericId,
      transaction_id,
      employee_id,
      department_id,
      type,
      category,
      amount,
      description,
      date: date || new Date(),
      paymentMethod,
      reference,
      createdBy: user.id,
    });

    await transaction.populate('organization', 'name');
    await transaction.populate('createdBy', 'name email');

    return {
      message: 'Transaction created successfully',
      transaction,
    };
  }

  /**
   * Update transaction
   * @param {Number} transactionId - Transaction ID (numeric)
   * @param {Object} updateData - Update data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated transaction
   */
  async updateTransaction(transactionId, updateData, user) {
    const transaction = await Transaction.findOne({ transaction_id: transactionId });

    if (!transaction) {
      throw { statusCode: 404, message: 'Transaction not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || transaction.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this transaction.' };
      }
    }

    // Update allowed fields
    const allowedFields = ['type', 'category', 'amount', 'description', 'date', 'paymentMethod', 'reference', 'status', 'employee_id', 'department_id'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        transaction[field] = updateData[field];
      }
    });

    await transaction.save();
    await transaction.populate('organization', 'name');
    await transaction.populate('createdBy', 'name email');

    return {
      message: 'Transaction updated successfully',
      transaction,
    };
  }

  /**
   * Delete transaction
   * @param {Number} transactionId - Transaction ID (numeric)
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Success message
   */
  async deleteTransaction(transactionId, user) {
    const transaction = await Transaction.findOne({ transaction_id: transactionId });

    if (!transaction) {
      throw { statusCode: 404, message: 'Transaction not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || transaction.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this transaction.' };
      }
    }

    await Transaction.deleteOne({ transaction_id: transactionId });

    return { message: 'Transaction deleted successfully' };
  }

  /**
   * Generate financial reports (Balance Sheet, P&L)
   * @param {Object} filters - Report filters
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Report data
   */
  async generateReports(filters, user) {
    const { organization, startDate, endDate, reportType } = filters;

    // Determine organization
    let organizationId = organization;
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org) {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
      organizationId = org._id;
    }

    const query = { organization: organizationId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query);

    let report = {};

    if (reportType === 'balance' || !reportType) {
      // Balance Sheet
      const totalIncome = transactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const netIncome = totalIncome - totalExpenses;

      report.balanceSheet = {
        assets: {
          totalIncome,
        },
        liabilities: {
          totalExpenses,
        },
        equity: {
          netIncome,
        },
        total: netIncome,
      };
    }

    if (reportType === 'profit-loss' || !reportType) {
      // Profit & Loss Statement
      const incomeByCategory = {};
      const expensesByCategory = {};

      transactions.forEach(transaction => {
        if (transaction.type === 'Income') {
          incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amount;
        } else if (transaction.type === 'Expense') {
          expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
        }
      });

      const totalIncome = Object.values(incomeByCategory).reduce((sum, amount) => sum + amount, 0);
      const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
      const netProfit = totalIncome - totalExpenses;

      report.profitLoss = {
        income: {
          byCategory: incomeByCategory,
          total: totalIncome,
        },
        expenses: {
          byCategory: expensesByCategory,
          total: totalExpenses,
        },
        netProfit,
        netProfitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) + '%' : '0%',
      };
    }

    return {
      message: 'Report generated successfully',
      period: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Present',
      },
      report,
    };
  }

  /**
   * Run bank/credit card reconciliation
   * @param {Object} reconciliationData - Reconciliation data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Reconciliation result
   */
  async runReconciliation(reconciliationData, user) {
    const { organization, type, accountName, statementDate, openingBalance, closingBalance, transactionIds } = reconciliationData;

    // Validate organization access
    let organizationId = organization;
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org) {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
      organizationId = org._id;
    }

    // Calculate expected balance from transactions
    const transactions = await Transaction.find({
      _id: { $in: transactionIds },
      organization: organizationId,
    });

    const transactionTotal = transactions.reduce((sum, t) => {
      if (t.type === 'Income') return sum + t.amount;
      if (t.type === 'Expense') return sum - t.amount;
      return sum;
    }, 0);

    const expectedBalance = openingBalance + transactionTotal;
    const discrepancy = closingBalance - expectedBalance;

    const discrepancies = [];
    if (Math.abs(discrepancy) > 0.01) {
      discrepancies.push({
        description: 'Balance discrepancy',
        amount: discrepancy,
        resolved: false,
      });
    }

    const reconciliation = await Reconciliation.create({
      organization: organizationId,
      type,
      accountName,
      statementDate,
      openingBalance,
      closingBalance,
      transactions: transactionIds,
      discrepancies,
      status: discrepancies.length > 0 ? 'Discrepancy' : 'Completed',
      performedBy: user.id,
      completedDate: new Date(),
    });

    // Update transaction reconciliation status
    if (discrepancies.length === 0) {
      await Transaction.updateMany(
        { _id: { $in: transactionIds } },
        {
          status: 'Reconciled',
          reconciledDate: new Date(),
          reconciledBy: user.id,
        }
      );
    }

    await reconciliation.populate('organization', 'name');
    await reconciliation.populate('performedBy', 'name email');

    return {
      message: 'Reconciliation completed',
      reconciliation,
      discrepancy: discrepancy !== 0 ? discrepancy : null,
    };
  }

  /**
   * Create budget/forecast
   * @param {Object} budgetData - Budget data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Created budget
   */
  async createBudget(budgetData, user) {
    const { organization, name, type, startDate, endDate, categories, notes } = budgetData;

    // Validate organization access
    let organizationId = organization;
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org) {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
      organizationId = org._id;
    } else {
      const org = await Organization.findById(organization);
      if (!org) {
        throw { statusCode: 404, message: 'Organization not found.' };
      }
    }

    const budget = await Budget.create({
      organization: organizationId,
      name,
      type,
      startDate,
      endDate,
      categories,
      notes,
      createdBy: user.id,
    });

    await budget.populate('organization', 'name');
    await budget.populate('createdBy', 'name email');

    return {
      message: 'Budget created successfully',
      budget,
    };
  }
}

module.exports = new FinanceService();

