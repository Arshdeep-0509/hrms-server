const mongoose = require('mongoose');

// Transaction Schema - Records all financial transactions
const TransactionSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  organization_id: {
    type: Number,
    required: true,
  },
  transaction_id: {
    type: Number,
    required: true,
    unique: true,
  },
  employee_id: {
    type: Number,
  },
  department_id: {
    type: Number,
  },
  type: {
    type: String,
    enum: ['Income', 'Expense', 'Transfer', 'Adjustment'],
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Check', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Other'],
    default: 'Bank Transfer',
  },
  reference: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Cleared', 'Reconciled', 'Void'],
    default: 'Pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reconciledDate: {
    type: Date,
  },
  reconciledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Budget Schema - Tracks budgets and forecasts
const BudgetSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Annual', 'Quarterly', 'Monthly', 'Custom'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  categories: [{
    category: {
      type: String,
      required: true,
    },
    budgetedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    actualAmount: {
      type: Number,
      default: 0,
    },
  }],
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Completed', 'Archived'],
    default: 'Draft',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// Reconciliation Schema - Tracks bank/credit card reconciliations
const ReconciliationSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  type: {
    type: String,
    enum: ['Bank', 'Credit Card', 'Cash', 'Other'],
    required: true,
  },
  accountName: {
    type: String,
    required: true,
    trim: true,
  },
  statementDate: {
    type: Date,
    required: true,
  },
  openingBalance: {
    type: Number,
    required: true,
  },
  closingBalance: {
    type: Number,
    required: true,
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  }],
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Discrepancy'],
    default: 'Pending',
  },
  discrepancies: [{
    description: String,
    amount: Number,
    resolved: {
      type: Boolean,
      default: false,
    },
  }],
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  completedDate: {
    type: Date,
  },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', TransactionSchema);
const Budget = mongoose.model('Budget', BudgetSchema);
const Reconciliation = mongoose.model('Reconciliation', ReconciliationSchema);

module.exports = {
  Transaction,
  Budget,
  Reconciliation,
};

