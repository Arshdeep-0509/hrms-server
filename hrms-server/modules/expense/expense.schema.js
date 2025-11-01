const mongoose = require('mongoose');
const Counter = require('../../models/counter.model');

// Expense Claim Schema
const ExpenseClaimSchema = new mongoose.Schema({
  claim_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  employee_id: {
    type: Number,
    required: true,
    ref: 'Employee'
  },
  claimNumber: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Travel',
      'Meals',
      'Accommodation',
      'Transport',
      'Office Supplies',
      'Training',
      'Software',
      'Communication',
      'Marketing',
      'Professional Services',
      'Utilities',
      'Healthcare',
      'Other'
    ]
  },
  subCategory: {
    type: String,
    trim: true
  },
  claimDate: {
    type: Date,
    required: true
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  expenses: [{
    expense_id: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true
    },
    expenseDate: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
      default: 'USD'
    },
    exchangeRate: {
      type: Number,
      default: 1
    },
    convertedAmount: {
      type: Number,
      required: true
    },
    receipt: {
      receipt_id: {
        type: Number
      },
      filename: {
        type: String
      },
      path: {
        type: String
      },
      url: {
        type: String
      },
      fileType: {
        type: String
      },
      uploadedDate: {
        type: Date
      }
    },
    isReceiptAttached: {
      type: Boolean,
      default: false
    },
    vendor: {
      name: {
        type: String,
        trim: true
      },
      address: {
        type: String,
        trim: true
      }
    },
    project: {
      type: String,
      trim: true
    },
    customer: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    isReimbursable: {
      type: Boolean,
      default: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  baseCurrency: {
    type: String,
    enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Forwarded', 'Reimbursed', 'Cancelled'],
    default: 'Draft'
  },
  approvalWorkflow: [{
    level: {
      type: Number,
      required: true
    },
    approver_id: {
      type: Number,
      ref: 'User'
    },
    approverName: {
      type: String
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Forwarded', 'Skipped'],
      default: 'Pending'
    },
    comments: {
      type: String
    },
    actionDate: {
      type: Date
    }
  }],
  currentApprover: {
    type: Number,
    ref: 'User'
  },
  submittedBy: {
    type: Number,
    required: true,
    ref: 'User'
  },
  approvedBy: {
    type: Number,
    ref: 'User'
  },
  approvedDate: {
    type: Date
  },
  rejectedBy: {
    type: Number,
    ref: 'User'
  },
  rejectedDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  reimbursedBy: {
    type: Number,
    ref: 'User'
  },
  reimbursedDate: {
    type: Date
  },
  reimbursementMethod: {
    type: String,
    enum: ['Payroll', 'Bank Transfer', 'Cash', 'Check', 'Other']
  },
  reimbursementReference: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Paid', 'Failed'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    name: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    uploadedDate: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  complianceNotes: {
    type: String,
    trim: true
  },
  isPolicyCompliant: {
    type: Boolean,
    default: true
  },
  policyViolations: [{
    violation: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    description: {
      type: String
    }
  }],
  createdDate: {
    type: Date,
    default: Date.now
  },
  lastModifiedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  _id: false
});

// Receipt Schema
const ReceiptSchema = new mongoose.Schema({
  receipt_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  employee_id: {
    type: Number,
    required: true,
    ref: 'Employee'
  },
  claim_id: {
    type: Number,
    ref: 'ExpenseClaim'
  },
  expense_id: {
    type: Number
  },
  filename: {
    type: String,
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String
  },
  fileType: {
    type: String,
    required: true,
    enum: ['PDF', 'JPG', 'JPEG', 'PNG', 'GIF', 'Other']
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: Number, // user_id
    required: true
  },
  ocrData: {
    isProcessed: {
      type: Boolean,
      default: false
    },
    processedDate: {
      type: Date
    },
    extractedData: {
      merchant: {
        type: String
      },
      totalAmount: {
        type: Number
      },
      date: {
        type: Date
      },
      currency: {
        type: String
      },
      items: [{
        description: {
          type: String
        },
        quantity: {
          type: Number
        },
        amount: {
          type: Number
        }
      }],
      taxAmount: {
        type: Number
      },
      paymentMethod: {
        type: String
      }
    },
    confidence: {
      type: Number, // 0-100
      default: 0
    },
    rawText: {
      type: String
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: Number
  },
  verifiedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Deleted', 'Archived'],
    default: 'Active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  _id: false
});

// Expense Policy Schema
const ExpensePolicySchema = new mongoose.Schema({
  policy_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  policyName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  categories: [{
    category: {
      type: String,
      required: true
    },
    maxDailyLimit: {
      type: Number,
      default: 0
    },
    maxMonthlyLimit: {
      type: Number,
      default: 0
    },
    maxAnnualLimit: {
      type: Number,
      default: 0
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    approvalThreshold: {
      type: Number,
      default: 0
    },
    requiresReceipt: {
      type: Boolean,
      default: true
    },
    receiptThreshold: {
      type: Number,
      default: 0
    },
    isReimbursable: {
      type: Boolean,
      default: true
    },
    allowedSubCategories: [{
      type: String
    }],
    disallowedSubCategories: [{
      type: String
    }]
  }],
  generalRules: {
    maxClaimAmount: {
      type: Number,
      default: 0
    },
    minClaimAmount: {
      type: Number,
      default: 0
    },
    claimSubmissionDeadline: {
      type: Number,
      default: 90 // in days
    },
    advanceRequestAllowed: {
      type: Boolean,
      default: false
    },
    currencyConversion: {
      allowed: {
        type: Boolean,
        default: true
      },
      exchangeRateSource: {
        type: String,
        enum: ['Real-time', 'Daily Average', 'Manual'],
        default: 'Real-time'
      }
    },
    requiresBusinessJustification: {
      type: Boolean,
      default: false
    },
    requiresProjectCode: {
      type: Boolean,
      default: false
    }
  },
  approvalLevels: [{
    level: {
      type: Number,
      required: true
    },
    amountThreshold: {
      type: Number,
      default: 0
    },
    approverRole: {
      type: String,
      required: true
    },
    isRequired: {
      type: Boolean,
      default: true
    }
  }],
  applicableTo: {
    roles: [{
      type: String
    }],
    departments: [{
      type: String
    }],
    employees: [{
      type: Number
    }]
  },
  createdBy: {
    type: Number,
    required: true
  },
  lastModifiedBy: {
    type: Number
  },
  lastModifiedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  _id: false
});

// Pre-save hooks for auto-incrementing IDs
ExpenseClaimSchema.pre('save', async function(next) {
  if (this.isNew && !this.claim_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'expense_claim_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.claim_id = counter.sequence_value;
      
      // Generate claim number if not provided
      if (!this.claimNumber) {
        const timestamp = Date.now().toString().slice(-6);
        this.claimNumber = `EXP-${timestamp}-${String(this.claim_id).padStart(4, '0')}`;
      }
      
      // Generate expense IDs for each expense
      if (this.expenses && this.expenses.length > 0) {
        for (let expense of this.expenses) {
          if (!expense.expense_id) {
            const expenseCounter = await Counter.findByIdAndUpdate(
              { _id: 'expense_item_id' },
              { $inc: { sequence_value: 1 } },
              { new: true, upsert: true }
            );
            expense.expense_id = expenseCounter.sequence_value;
          }
        }
      }
      
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

ReceiptSchema.pre('save', async function(next) {
  if (this.isNew && !this.receipt_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'expense_receipt_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.receipt_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

ExpensePolicySchema.pre('save', async function(next) {
  if (this.isNew && !this.policy_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'expense_policy_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.policy_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

// Create models
const ExpenseClaim = mongoose.model('ExpenseClaim', ExpenseClaimSchema);
const Receipt = mongoose.model('Receipt', ReceiptSchema);
const ExpensePolicy = mongoose.model('ExpensePolicy', ExpensePolicySchema);

module.exports = {
  ExpenseClaim,
  Receipt,
  ExpensePolicy
};
