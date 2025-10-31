# Finance Module

## Overview
The Finance module handles financial transactions, accounting, budgets, and financial reporting.

## Purpose
Manage organizational finances, track transactions, generate financial reports, and maintain accounting records.

## File Structure
```
finance/
├── finance.schema.js     # Database models
├── finance.service.js    # Business logic
├── finance.controller.js # Request handlers
├── finance.routes.js     # API endpoints
└── README.md             # This file
```

## Schemas

### Transaction
- transaction_id, organization_id
- type (Income, Expense, Transfer, Refund)
- amount, currency, date
- description, category
- account_id, vendor_id
- status tracking

### Account
- account_id, organization_id
- accountName, accountType
- balance, currency
- accountNumber, bank details

### Budget
- budget_id, organization_id
- budgetName, category
- allocatedAmount, spentAmount
- budgetPeriod, status

### FinancialReport
- reportType (Income Statement, Balance Sheet, etc.)
- reportData with financial metrics
- reportPeriod, filters

## Key Features
- Transaction management
- Multiple account types
- Budget tracking
- Financial reporting
- Multi-currency support
- Vendor management

## API Endpoints
- `POST /api/finance/transactions` - Record transaction
- `GET /api/finance/transactions` - List transactions
- `POST /api/finance/accounts` - Create account
- `GET /api/finance/budgets` - View budgets
- `GET /api/finance/reports` - Generate reports

## Related Modules
- **Expense** - Expense claims
- **Payroll** - Payroll expenses
- **Organization** - Financial settings
