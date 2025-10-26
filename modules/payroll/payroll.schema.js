const mongoose = require('mongoose');

// Payroll Cycle Schema
const PayrollCycleSchema = new mongoose.Schema({
  cycle_id: {
    type: Number,
    required: true,
    unique: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  organization_id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  payPeriod: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  payDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Draft',
  },
  cycleType: {
    type: String,
    enum: ['Monthly', 'Bi-weekly', 'Weekly', 'Custom'],
    required: true,
  },
  totalEmployees: {
    type: Number,
    default: 0,
  },
  totalGrossPay: {
    type: Number,
    default: 0,
  },
  totalDeductions: {
    type: Number,
    default: 0,
  },
  totalNetPay: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    default: 'INR',
  },
  notes: String,
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  processedAt: Date,
}, { timestamps: true });

// Payslip Schema
const PayslipSchema = new mongoose.Schema({
  payslip_id: {
    type: Number,
    required: true,
    unique: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  employee_id: {
    type: Number,
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  organization_id: {
    type: Number,
    required: true,
  },
  payrollCycle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollCycle',
    required: true,
  },
  cycle_id: {
    type: Number,
    required: true,
  },
  
  // Employee Details
  employeeDetails: {
    name: {
      type: String,
      required: true,
    },
    employeeId: {
      type: Number,
      required: true,
    },
    position: String,
    department: String,
    hireDate: Date,
  },
  
  // Pay Period
  payPeriod: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  payDate: {
    type: Date,
    required: true,
  },
  
  // Earnings
  earnings: {
    basicSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    allowances: [{
      name: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      taxable: {
        type: Boolean,
        default: true,
      },
    }],
    overtime: {
      type: Number,
      default: 0,
    },
    bonuses: [{
      name: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      taxable: {
        type: Boolean,
        default: true,
      },
    }],
    totalEarnings: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  
  // Deductions
  deductions: {
    incomeTax: {
      type: Number,
      default: 0,
    },
    socialSecurity: {
      type: Number,
      default: 0,
    },
    healthInsurance: {
      type: Number,
      default: 0,
    },
    retirement: {
      type: Number,
      default: 0,
    },
    otherDeductions: [{
      name: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        enum: ['Tax', 'Insurance', 'Loan', 'Other'],
        default: 'Other',
      },
    }],
    totalDeductions: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  
  // Net Pay
  netPay: {
    type: Number,
    required: true,
    default: 0,
  },
  
  // Tax Information
  taxInformation: {
    taxYear: Number,
    taxBracket: String,
    exemptions: Number,
    taxableIncome: Number,
  },
  
  // Status and Processing
  status: {
    type: String,
    enum: ['Generated', 'Approved', 'Paid', 'Cancelled'],
    default: 'Generated',
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Check', 'Cash', 'Other'],
    default: 'Bank Transfer',
  },
  paymentReference: String,
  paidAt: Date,
  
  // Additional Information
  notes: String,
  attachments: [{
    name: String,
    url: String,
    type: String,
  }],
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
}, { timestamps: true });

// Payroll Tax Schema
const PayrollTaxSchema = new mongoose.Schema({
  tax_id: {
    type: Number,
    required: true,
    unique: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  organization_id: {
    type: Number,
    required: true,
  },
  taxYear: {
    type: Number,
    required: true,
  },
  taxPeriod: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  taxType: {
    type: String,
    enum: ['Income Tax', 'Social Security', 'Medicare', 'State Tax', 'Local Tax', 'Other'],
    required: true,
  },
  taxName: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  
  // Tax Calculations
  totalTaxableWages: {
    type: Number,
    required: true,
    default: 0,
  },
  totalTaxAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  employeeContribution: {
    type: Number,
    default: 0,
  },
  employerContribution: {
    type: Number,
    default: 0,
  },
  
  // Filing Information
  filingStatus: {
    type: String,
    enum: ['Draft', 'Filed', 'Paid', 'Overdue'],
    default: 'Draft',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  filedDate: Date,
  paidDate: Date,
  filingReference: String,
  
  // Tax Rates and Rules
  taxRate: {
    type: Number,
    required: true,
  },
  taxBrackets: [{
    minIncome: Number,
    maxIncome: Number,
    rate: Number,
  }],
  
  // Additional Information
  notes: String,
  attachments: [{
    name: String,
    url: String,
    type: String,
  }],
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  filedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Payroll Report Schema
const PayrollReportSchema = new mongoose.Schema({
  report_id: {
    type: Number,
    required: true,
    unique: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  organization_id: {
    type: Number,
    required: true,
  },
  reportType: {
    type: String,
    enum: ['Payroll Summary', 'Tax Report', 'Employee Summary', 'Department Summary', 'Custom'],
    required: true,
  },
  reportName: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  
  // Report Period
  reportPeriod: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  
  // Report Data
  reportData: {
    totalEmployees: Number,
    totalGrossPay: Number,
    totalDeductions: Number,
    totalNetPay: Number,
    totalTaxes: Number,
    departmentBreakdown: [{
      department: String,
      employeeCount: Number,
      totalPay: Number,
    }],
    employeeBreakdown: [{
      employeeId: Number,
      employeeName: String,
      grossPay: Number,
      deductions: Number,
      netPay: Number,
    }],
  },
  
  // Report Configuration
  filters: {
    departments: [String],
    employeeIds: [Number],
    payRanges: [{
      min: Number,
      max: Number,
    }],
  },
  
  // Report Status
  status: {
    type: String,
    enum: ['Generating', 'Completed', 'Failed'],
    default: 'Generating',
  },
  generatedAt: Date,
  reportUrl: String,
  
  // Additional Information
  notes: String,
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Indexes for better query performance
PayrollCycleSchema.index({ cycle_id: 1 });
PayrollCycleSchema.index({ organization: 1 });
PayrollCycleSchema.index({ status: 1 });
PayrollCycleSchema.index({ payDate: -1 });

PayslipSchema.index({ payslip_id: 1 });
PayslipSchema.index({ employee: 1 });
PayslipSchema.index({ organization: 1 });
PayslipSchema.index({ payrollCycle: 1 });
PayslipSchema.index({ payDate: -1 });
PayslipSchema.index({ status: 1 });

PayrollTaxSchema.index({ tax_id: 1 });
PayrollTaxSchema.index({ organization: 1 });
PayrollTaxSchema.index({ taxYear: 1 });
PayrollTaxSchema.index({ filingStatus: 1 });

PayrollReportSchema.index({ report_id: 1 });
PayrollReportSchema.index({ organization: 1 });
PayrollReportSchema.index({ reportType: 1 });
PayrollReportSchema.index({ generatedAt: -1 });

// Create models
const PayrollCycle = mongoose.model('PayrollCycle', PayrollCycleSchema);
const Payslip = mongoose.model('Payslip', PayslipSchema);
const PayrollTax = mongoose.model('PayrollTax', PayrollTaxSchema);
const PayrollReport = mongoose.model('PayrollReport', PayrollReportSchema);

module.exports = {
  PayrollCycle,
  Payslip,
  PayrollTax,
  PayrollReport,
};
