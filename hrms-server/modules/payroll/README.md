# Payroll Module

## Overview
The Payroll module manages employee compensation, payslips, tax calculations, and payroll cycles.

## Purpose
Automate payroll processing, calculate earnings and deductions, generate payslips, and handle tax compliance.

## File Structure
```
payroll/
├── payroll.schema.js     # Database models
├── payroll.service.js    # Business logic
├── payroll.controller.js # Request handlers
├── payroll.routes.js     # API endpoints
└── README.md             # This file
```

## Schemas

### PayrollCycle
- cycle_id, organization_id
- payPeriod (startDate, endDate)
- payDate, cycleType
- Total employees and amounts
- Status tracking

### Payslip
- employeeDetails
- earnings (basic, allowances, overtime, bonuses)
- deductions (tax, insurance, retirement)
- netPay calculation
- Payment method and status

### PayrollTax
- tax_id, organization_id
- taxYear, taxPeriod
- taxType, taxRates
- Filing status and dates
- Employee/employer contributions

### PayrollReport
- Report types (Summary, Tax, Employee, Department)
- Report data with breakdowns
- Filters and configuration

## Key Features
- Multiple earnings components
- Comprehensive deductions
- Tax calculations and brackets
- Automated payroll cycles
- Multiple payment methods
- Tax filing tracking

## API Endpoints
- `POST /api/payroll/cycles` - Create payroll cycle
- `GET /api/payroll/payslips` - View payslips
- `POST /api/payroll/process` - Process payroll
- `GET /api/payroll/taxes` - Tax records
- `GET /api/payroll/reports` - Generate reports

## Related Modules
- **Employee** - Employee details and salary
- **Attendance** - Hours worked
- **Organization** - Payroll settings
