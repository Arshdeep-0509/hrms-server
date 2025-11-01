# Expense Claim Management Module

## Overview
The Expense Claim Management module handles employee reimbursements, business expense tracking, and approval workflows.

## Purpose
Streamline expense claim submission, receipt management, approval processes, and reimbursement tracking.

## File Structure
```
expense/
├── expense.schema.js      # Database models (3 schemas)
├── expense.service.js     # Business logic
├── expense.controller.js  # Request handlers
├── expense.routes.js      # API endpoints (16 endpoints)
└── README.md              # This file
```

## Schemas

### ExpenseClaim
- claim_id, claimNumber (auto-generated)
- employee_id, organization_id
- category (Travel, Meals, Office Supplies, etc.)
- expenses array with individual items
- totalAmount calculation
- status workflow
- approval workflow (multi-level)
- reimbursement tracking

### Receipt
- receipt_id, organization_id, employee_id
- File upload (PDF, JPG, PNG)
- OCR data extraction
- Merchant, amount, date extraction
- Confidence scoring
- Verification status

### ExpensePolicy
- Category-wise limits
- Daily/monthly/annual limits
- Receipt requirements
- Approval thresholds
- Applicable roles/departments

## Key Features (16 APIs)
- Claim creation and submission
- Receipt upload and OCR
- Multi-level approval workflow
- Policy enforcement
- Category-wise analytics
- Monthly reports
- Payout processing

## API Endpoints
Claims (5), Receipts (3), Approval (3), Payout (1), Reports (2), Policy (2)

## Workflow
1. Employee creates expense claim
2. Attaches receipts (optional OCR)
3. Submits for approval
4. Manager reviews and approves/rejects
5. Finance processes reimbursement
6. Integrated with payroll

## Related Modules
- **Employee** - Claim creators
- **Organization** - Policies
- **Payroll** - Reimbursement payments
