# 💰 Payroll Management Module

## Overview

The Payroll Management module provides comprehensive payroll processing capabilities for the HRMS system. It handles payroll cycles, employee payments, tax calculations, and reporting functionality.

## Features

- **Payroll Cycle Management**: Create, update, and manage payroll cycles
- **Automated Payroll Processing**: Process payroll for multiple employees
- **Payslip Generation**: Generate detailed payslips for employees
- **Tax Management**: Handle payroll taxes and tax reporting
- **Comprehensive Reporting**: Generate various payroll reports
- **Role-based Access Control**: Secure access based on user roles

## Database Schema

### PayrollCycle
Manages payroll cycles and periods.

```javascript
{
  cycle_id: Number,           // Unique cycle identifier
  organization: ObjectId,     // Reference to organization
  organization_id: Number,    // Organization ID
  name: String,              // Cycle name
  description: String,       // Cycle description
  payPeriod: {
    startDate: Date,         // Pay period start
    endDate: Date           // Pay period end
  },
  payDate: Date,            // Payment date
  status: String,           // Draft, In Progress, Completed, Cancelled
  cycleType: String,        // Monthly, Bi-weekly, Weekly, Custom
  totalEmployees: Number,   // Number of employees in cycle
  totalGrossPay: Number,    // Total gross pay
  totalDeductions: Number,  // Total deductions
  totalNetPay: Number,      // Total net pay
  currency: String,         // Currency code
  notes: String,            // Additional notes
  createdBy: ObjectId,      // Creator reference
  updatedBy: ObjectId,      // Last updater reference
  processedBy: ObjectId,    // Processor reference
  processedAt: Date         // Processing timestamp
}
```

### Payslip
Individual employee payslip records.

```javascript
{
  payslip_id: Number,       // Unique payslip identifier
  employee: ObjectId,       // Employee reference
  employee_id: Number,      // Employee ID
  organization: ObjectId,   // Organization reference
  organization_id: Number,  // Organization ID
  payrollCycle: ObjectId,   // Payroll cycle reference
  cycle_id: Number,         // Cycle ID
  employeeDetails: {
    name: String,           // Employee name
    employeeId: Number,     // Employee ID
    position: String,       // Job position
    department: String,     // Department
    hireDate: Date         // Hire date
  },
  payPeriod: {
    startDate: Date,        // Pay period start
    endDate: Date          // Pay period end
  },
  payDate: Date,           // Payment date
  earnings: {
    basicSalary: Number,    // Basic salary
    allowances: [{          // Allowances array
      name: String,         // Allowance name
      amount: Number,       // Allowance amount
      taxable: Boolean      // Taxable flag
    }],
    overtime: Number,       // Overtime pay
    bonuses: [{             // Bonuses array
      name: String,         // Bonus name
      amount: Number,       // Bonus amount
      taxable: Boolean      // Taxable flag
    }],
    totalEarnings: Number   // Total earnings
  },
  deductions: {
    incomeTax: Number,      // Income tax
    socialSecurity: Number, // Social security
    healthInsurance: Number,// Health insurance
    retirement: Number,     // Retirement contribution
    otherDeductions: [{     // Other deductions
      name: String,         // Deduction name
      amount: Number,       // Deduction amount
      type: String          // Deduction type
    }],
    totalDeductions: Number // Total deductions
  },
  netPay: Number,          // Net pay amount
  taxInformation: {
    taxYear: Number,        // Tax year
    taxBracket: String,     // Tax bracket
    exemptions: Number,     // Tax exemptions
    taxableIncome: Number   // Taxable income
  },
  status: String,          // Generated, Approved, Paid, Cancelled
  paymentMethod: String,   // Bank Transfer, Check, Cash, Other
  paymentReference: String,// Payment reference
  paidAt: Date,           // Payment timestamp
  notes: String,          // Additional notes
  attachments: [{         // Attachments
    name: String,         // File name
    url: String,          // File URL
    type: String          // File type
  }],
  createdBy: ObjectId,    // Creator reference
  updatedBy: ObjectId,    // Last updater reference
  approvedBy: ObjectId,   // Approver reference
  approvedAt: Date        // Approval timestamp
}
```

### PayrollTax
Payroll tax records and filings.

```javascript
{
  tax_id: Number,          // Unique tax identifier
  organization: ObjectId,  // Organization reference
  organization_id: Number, // Organization ID
  taxYear: Number,         // Tax year
  taxPeriod: {
    startDate: Date,       // Tax period start
    endDate: Date         // Tax period end
  },
  taxType: String,         // Income Tax, Social Security, etc.
  taxName: String,         // Tax name
  description: String,     // Tax description
  totalTaxableWages: Number, // Total taxable wages
  totalTaxAmount: Number,  // Total tax amount
  employeeContribution: Number, // Employee contribution
  employerContribution: Number, // Employer contribution
  filingStatus: String,    // Draft, Filed, Paid, Overdue
  dueDate: Date,          // Filing due date
  filedDate: Date,        // Filing date
  paidDate: Date,         // Payment date
  filingReference: String, // Filing reference
  taxRate: Number,        // Tax rate
  taxBrackets: [{         // Tax brackets
    minIncome: Number,    // Minimum income
    maxIncome: Number,    // Maximum income
    rate: Number          // Tax rate
  }],
  notes: String,          // Additional notes
  attachments: [{         // Attachments
    name: String,         // File name
    url: String,          // File URL
    type: String          // File type
  }],
  createdBy: ObjectId,    // Creator reference
  updatedBy: ObjectId,    // Last updater reference
  filedBy: ObjectId       // Filer reference
}
```

### PayrollReport
Generated payroll reports.

```javascript
{
  report_id: Number,       // Unique report identifier
  organization: ObjectId,  // Organization reference
  organization_id: Number, // Organization ID
  reportType: String,      // Report type
  reportName: String,      // Report name
  description: String,     // Report description
  reportPeriod: {
    startDate: Date,       // Report period start
    endDate: Date         // Report period end
  },
  reportData: {
    totalEmployees: Number, // Total employees
    totalGrossPay: Number,  // Total gross pay
    totalDeductions: Number, // Total deductions
    totalNetPay: Number,    // Total net pay
    totalTaxes: Number,     // Total taxes
    departmentBreakdown: [{ // Department breakdown
      department: String,   // Department name
      employeeCount: Number, // Employee count
      totalPay: Number      // Total pay
    }],
    employeeBreakdown: [{   // Employee breakdown
      employeeId: Number,   // Employee ID
      employeeName: String, // Employee name
      grossPay: Number,     // Gross pay
      deductions: Number,   // Deductions
      netPay: Number        // Net pay
    }]
  },
  filters: {
    departments: [String],  // Department filters
    employeeIds: [Number],  // Employee ID filters
    payRanges: [{          // Pay range filters
      min: Number,         // Minimum pay
      max: Number          // Maximum pay
    }]
  },
  status: String,          // Generating, Completed, Failed
  generatedAt: Date,       // Generation timestamp
  reportUrl: String,       // Report download URL
  notes: String,           // Additional notes
  createdBy: ObjectId,     // Creator reference
  generatedBy: ObjectId    // Generator reference
}
```

## API Endpoints

### Payroll Cycles

| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/payroll/cycles` | GET | View payroll cycles | Client Admin / Payroll Specialist |
| `/api/payroll/cycles` | POST | Create new payroll cycle | Payroll Specialist |
| `/api/payroll/cycles/:id` | GET | Get payroll cycle by ID | Client Admin / Payroll Specialist |
| `/api/payroll/cycles/:id` | PUT | Update payroll cycle | Payroll Specialist |

### Payroll Processing

| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/payroll/run` | POST | Process payroll for employees | Payroll Specialist |

### Payslips

| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/payroll/payslips/:employeeId` | GET | Fetch payslips for employee | Payroll / Employee |
| `/api/payroll/payslips/single/:id` | GET | Get payslip by ID | Payroll / Employee |
| `/api/payroll/payslips/:id/status` | PUT | Update payslip status | Payroll Specialist |

### Tax Management

| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/payroll/taxes` | GET | View payroll tax details | Payroll / Bookkeeping |
| `/api/payroll/taxes` | POST | Create payroll tax record | Payroll Specialist |
| `/api/payroll/taxes/:id` | GET | Get payroll tax by ID | Payroll / Bookkeeping |
| `/api/payroll/taxes/:id` | PUT | Update payroll tax record | Payroll Specialist |
| `/api/payroll/taxes/file` | POST | File tax reports | Payroll Specialist |

### Reports

| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/payroll/reports` | GET | List payroll reports | Payroll / Client Admin |
| `/api/payroll/reports` | POST | Generate payroll report | Payroll / Client Admin |
| `/api/payroll/reports/:id` | GET | Get payroll report by ID | Payroll / Client Admin |
| `/api/payroll/reports/:id/download` | GET | Download payroll report | Payroll / Client Admin |

## Usage Examples

### Create Payroll Cycle

```javascript
POST /api/payroll/cycles
{
  "cycle_id": 1001,
  "organization_id": 1,
  "name": "January 2024 Payroll",
  "description": "Monthly payroll for January 2024",
  "payPeriod": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "payDate": "2024-02-05",
  "cycleType": "Monthly",
  "notes": "Regular monthly payroll cycle"
}
```

### Process Payroll

```javascript
POST /api/payroll/run
{
  "cycleId": 1001,
  "employeeIds": [101, 102, 103],
  "payPeriod": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "payDate": "2024-02-05"
}
```

### Generate Payroll Report

```javascript
POST /api/payroll/reports
{
  "reportType": "Payroll Summary",
  "reportName": "January 2024 Payroll Summary",
  "description": "Monthly payroll summary report",
  "reportPeriod": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "filters": {
    "departments": ["Engineering", "Marketing"],
    "payRanges": [
      { "min": 50000, "max": 100000 }
    ]
  }
}
```

### File Tax Report

```javascript
POST /api/payroll/taxes/file
{
  "taxId": 2001,
  "filingReference": "TAX-2024-001",
  "notes": "Q1 2024 income tax filing"
}
```

## Access Control

### Role Permissions

- **Super Admin**: Full access to all payroll functions
- **Client Admin**: View payroll cycles, generate reports, view payslips
- **Payroll Specialist**: Full payroll management, processing, and tax filing
- **Bookkeeping**: View tax details and reports
- **Employee**: View own payslips only

### Security Features

- Organization-based data isolation
- Role-based access control
- Audit trails for all operations
- Secure file handling for attachments
- Data validation and sanitization

## Business Logic

### Payroll Processing

1. **Cycle Creation**: Create payroll cycle with defined period
2. **Employee Selection**: Select employees for payroll processing
3. **Calculation**: Calculate earnings, deductions, and net pay
4. **Payslip Generation**: Generate individual payslips
5. **Approval**: Review and approve payroll
6. **Payment**: Process payments to employees
7. **Reporting**: Generate payroll reports

### Tax Calculations

- **Income Tax**: Based on tax brackets and exemptions
- **Social Security**: Percentage of gross income
- **Health Insurance**: Fixed amount or percentage
- **Retirement**: Employee and employer contributions
- **Other Deductions**: Custom deductions as configured

### Report Types

- **Payroll Summary**: Overview of payroll cycle
- **Tax Report**: Tax calculations and filings
- **Employee Summary**: Individual employee breakdown
- **Department Summary**: Department-wise payroll data
- **Custom Reports**: Configurable reports based on filters

## Error Handling

The module includes comprehensive error handling:

- **Validation Errors**: Input validation with detailed messages
- **Authorization Errors**: Access control violations
- **Business Logic Errors**: Payroll processing errors
- **Database Errors**: Data persistence issues
- **File Processing Errors**: Report generation issues

## Performance Considerations

- **Indexing**: Optimized database indexes for fast queries
- **Pagination**: Large dataset handling
- **Caching**: Frequently accessed data caching
- **Background Processing**: Asynchronous report generation
- **Data Archiving**: Historical data management

## Integration Points

- **Employee Module**: Employee data and salary information
- **Organization Module**: Organization structure and settings
- **User Module**: User authentication and authorization
- **Finance Module**: Financial reporting and accounting
- **Notification System**: Payroll notifications and alerts

## Future Enhancements

- **Automated Tax Filing**: Integration with tax authorities
- **Multi-Currency Support**: International payroll processing
- **Advanced Reporting**: Custom report builder
- **Mobile App Integration**: Mobile payslip access
- **API Integrations**: Third-party payroll services
- **Compliance Management**: Regulatory compliance tracking
- **Audit Logging**: Enhanced audit trails
- **Workflow Automation**: Automated approval workflows
