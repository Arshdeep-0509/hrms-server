# Finance Module - Bookkeeping & Finance APIs

## Overview
The Finance module manages accounting, expenses, financial reports, reconciliations, and budgets for organizations.

## Module Structure
```
modules/finance/
├── finance.schema.js    # Database models (Transaction, Budget, Reconciliation)
├── finance.service.js   # Business logic
├── finance.controller.js # Request handlers
├── finance.routes.js    # API routes
└── README.md           # This file
```

## Database Models

### Transaction
Records all financial transactions (income, expenses, transfers, adjustments).

**Fields:**
- `organization` - Reference to Organization (ObjectId)
- `organization_id` - Organization ID (Number, required)
- `transaction_id` - Transaction ID (Number, required, unique)
- `employee_id` - Employee ID (Number, optional)
- `department_id` - Department ID (Number, optional)
- `type` - Income, Expense, Transfer, Adjustment
- `category` - Transaction category
- `amount` - Transaction amount
- `description` - Transaction description
- `date` - Transaction date
- `paymentMethod` - Cash, Check, Bank Transfer, Credit Card, Debit Card, Other
- `reference` - Reference number
- `status` - Pending, Cleared, Reconciled, Void
- `createdBy` - User who created the transaction
- `reconciledDate` - Date reconciled
- `reconciledBy` - User who reconciled

### Budget
Tracks budgets and forecasts for organizations.

**Fields:**
- `organization` - Reference to Organization
- `name` - Budget name
- `type` - Annual, Quarterly, Monthly, Custom
- `startDate` - Budget start date
- `endDate` - Budget end date
- `categories` - Array of budget categories with amounts
- `status` - Draft, Active, Completed, Archived
- `createdBy` - User who created the budget
- `notes` - Additional notes

### Reconciliation
Tracks bank/credit card reconciliations.

**Fields:**
- `organization` - Reference to Organization
- `type` - Bank, Credit Card, Cash, Other
- `accountName` - Account name
- `statementDate` - Statement date
- `openingBalance` - Opening balance
- `closingBalance` - Closing balance
- `transactions` - Array of transaction references
- `status` - Pending, In Progress, Completed, Discrepancy
- `discrepancies` - Array of discrepancies
- `performedBy` - User who performed reconciliation
- `completedDate` - Completion date

## API Endpoints

### 1. List Transactions
**GET** `/api/finance/transactions`

Access: Bookkeeper / Super Admin

**Query Parameters:**
- `type` - Filter by transaction type (Income, Expense, Transfer, Adjustment)
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)
- `organization` - Filter by organization ID (Super Admin only)
- `status` - Filter by status (Pending, Cleared, Reconciled, Void)

**Example:**
```bash
GET /api/finance/transactions?type=Expense&startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
[
  {
    "_id": "...",
    "organization": { "name": "Acme Corp" },
    "type": "Expense",
    "category": "Utilities",
    "amount": 1500,
    "description": "Electricity bill",
    "date": "2024-01-15T00:00:00.000Z",
    "paymentMethod": "Bank Transfer",
    "status": "Cleared",
    "createdBy": { "name": "John Doe", "email": "john@example.com" }
  }
]
```

### 2. Create Transaction
**POST** `/api/finance/transactions`

Access: Bookkeeper

**Request Body:**
```json
{
  "organization": "65f1234567890abcdef12345",
  "organization_id": 1,
  "transaction_id": 1001,
  "employee_id": 500,
  "department_id": 10,
  "type": "Expense",
  "category": "Utilities",
  "amount": 1500,
  "description": "Electricity bill for January",
  "date": "2024-01-15",
  "paymentMethod": "Bank Transfer",
  "reference": "INV-001"
}
```

**Note:** `transaction_id` is required and must be unique. `employee_id` and `department_id` are optional.

**Response:**
```json
{
  "message": "Transaction created successfully",
  "transaction": { ... }
}
```

### 3. Update Transaction
**PUT** `/api/finance/transactions/:transaction_id`

Access: Bookkeeper

**URL Parameter:** `transaction_id` (numeric)

**Request Body:** (only fields to update)
```json
{
  "amount": 1600,
  "status": "Reconciled",
  "employee_id": 500,
  "department_id": 10
}
```

**Response:**
```json
{
  "message": "Transaction updated successfully",
  "transaction": { ... }
}
```

### 4. Delete Transaction
**DELETE** `/api/finance/transactions/:transaction_id`

Access: Bookkeeper

**URL Parameter:** `transaction_id` (numeric)

**Response:**
```json
{
  "message": "Transaction deleted successfully"
}
```

### 5. Generate Financial Reports
**GET** `/api/finance/reports`

Access: Bookkeeper / Client Admin

**Query Parameters:**
- `organization` - Organization ID (Super Admin only)
- `startDate` - Report start date
- `endDate` - Report end date
- `reportType` - balance, profit-loss (optional, returns both if not specified)

**Example:**
```bash
GET /api/finance/reports?startDate=2024-01-01&endDate=2024-12-31&reportType=profit-loss
```

**Response:**
```json
{
  "message": "Report generated successfully",
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  },
  "report": {
    "balanceSheet": {
      "assets": { "totalIncome": 100000 },
      "liabilities": { "totalExpenses": 75000 },
      "equity": { "netIncome": 25000 },
      "total": 25000
    },
    "profitLoss": {
      "income": {
        "byCategory": { "Sales": 80000, "Services": 20000 },
        "total": 100000
      },
      "expenses": {
        "byCategory": { "Utilities": 15000, "Salaries": 50000, "Rent": 10000 },
        "total": 75000
      },
      "netProfit": 25000,
      "netProfitMargin": "25.00%"
    }
  }
}
```

### 6. Run Reconciliation
**POST** `/api/finance/reconciliation`

Access: Bookkeeper

**Request Body:**
```json
{
  "organization": "65f1234567890abcdef12345",
  "type": "Bank",
  "accountName": "Main Checking Account",
  "statementDate": "2024-01-31",
  "openingBalance": 10000,
  "closingBalance": 15000,
  "transactionIds": [
    "65f1234567890abcdef12346",
    "65f1234567890abcdef12347"
  ]
}
```

**Response:**
```json
{
  "message": "Reconciliation completed",
  "reconciliation": { ... },
  "discrepancy": null
}
```

### 7. Create Budget
**POST** `/api/finance/budget`

Access: Bookkeeper / Client Admin

**Request Body:**
```json
{
  "organization": "65f1234567890abcdef12345",
  "name": "Q1 2024 Budget",
  "type": "Quarterly",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "categories": [
    {
      "category": "Salaries",
      "budgetedAmount": 150000
    },
    {
      "category": "Utilities",
      "budgetedAmount": 10000
    },
    {
      "category": "Marketing",
      "budgetedAmount": 25000
    }
  ],
  "notes": "Q1 Budget for 2024 fiscal year"
}
```

**Response:**
```json
{
  "message": "Budget created successfully",
  "budget": { ... }
}
```

## Authorization

### Role-Based Access
- **Bookkeeper**: Full access to all finance operations
- **Super Admin**: Can view all transactions across organizations
- **Client Admin**: Can view reports and create budgets for their organization

### Automatic Organization Filtering
- Non-Super Admin users are automatically restricted to their organization's data
- Super Admin can specify organization filters

## Usage Examples

### Example 1: Record Monthly Rent Payment
```bash
POST /api/finance/transactions
Authorization: Bearer <token>

{
  "organization": "65f1234567890abcdef12345",
  "organization_id": 1,
  "transaction_id": 1001,
  "type": "Expense",
  "category": "Rent",
  "amount": 5000,
  "description": "Office rent - January 2024",
  "paymentMethod": "Bank Transfer",
  "reference": "RENT-JAN-2024"
}
```

### Example 2: Generate Monthly P&L Report
```bash
GET /api/finance/reports?startDate=2024-01-01&endDate=2024-01-31&reportType=profit-loss
Authorization: Bearer <token>
```

### Example 3: Reconcile Bank Statement
```bash
POST /api/finance/reconciliation
Authorization: Bearer <token>

{
  "organization": "65f1234567890abcdef12345",
  "type": "Bank",
  "accountName": "Business Checking",
  "statementDate": "2024-01-31",
  "openingBalance": 25000,
  "closingBalance": 45000,
  "transactionIds": ["..."],
}
```

## Notes
- All endpoints require authentication (`protect` middleware)
- Routes use numeric IDs (`transaction_id`) instead of MongoDB ObjectIds in URL parameters
- `transaction_id` must be unique and is required when creating transactions
- `organization_id`, `employee_id`, and `department_id` are numeric IDs for cross-referencing
- Date filters use ISO format (YYYY-MM-DD)
- Amounts are stored as numbers (decimals supported)
- Transactions can be filtered by multiple criteria simultaneously
- Reports can generate both Balance Sheet and P&L or individual reports
- Reconciliation automatically updates transaction status when completed

