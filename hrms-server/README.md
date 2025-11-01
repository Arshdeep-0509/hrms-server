# HRMS Server - Comprehensive Management System

## 📋 Overview

This is a comprehensive Human Resource Management System (HRMS) built with Node.js, Express, and MongoDB. The system is designed as a multi-tenant platform supporting multiple organizations with extensive HR, payroll, recruitment, attendance, and other HR operations.

## 🏗️ Architecture

The system follows a modular architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│                 (Web/Mobile Applications)                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    API Layer                                │
│              Express.js Routes & Controllers                │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   Middleware Layer                          │
│         Authentication & Authorization                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   Business Logic Layer                      │
│                     Services                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   Data Access Layer                         │
│                Mongoose Models & Schemas                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   Database Layer                            │
│                      MongoDB                                │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Module Structure Diagram

```
HRMS Server
│
├── 🔐 Core Modules
│   ├── Auth (Authentication & Authorization)
│   ├── User (User Management)
│   ├── Role (Role & Permissions)
│   └── Organization (Multi-tenant Organizations)
│
├── 👥 Human Resources Modules
│   ├── Employee (Employee Management)
│   ├── Department (Organization Structure)
│   └── Recruitment (Hiring & Talent)
│
├── ⏰ Time & Attendance Modules
│   ├── Attendance (Clock In/Out, Shifts)
│   └── Leave (Leave Management & Policies)
│
├── 💰 Financial Modules
│   ├── Payroll (Salary & Compensation)
│   ├── Finance (Accounting & Transactions)
│   └── Expense (Claims & Reimbursements)
│
├── 🏥 Specialized Modules
│   └── Healthcare (Clinical HR & HIPAA)
│
├── 🛠️ Support Modules
│   ├── Helpdesk (IT Support Tickets)
│   └── Asset (Asset Tracking & Management)
│
└── 📊 Cross-Module Features
    ├── Reporting (Multi-module reports)
    ├── Analytics (Data insights)
    └── Audit Logs (Compliance & tracking)
```

## 🎯 Module Overview

### Core Modules

#### 🔐 Auth Module
- **Purpose**: User authentication and token management
- **Key Features**: Registration, login, JWT tokens, password hashing
- **APIs**: 3 endpoints
- **Dependencies**: User schema
- [View Details](./modules/auth/README.md)

#### 👤 User Module
- **Purpose**: User profile and account management
- **Key Features**: Profile management, CRUD operations, role-based access
- **APIs**: 6 endpoints
- **Schemas**: User with auto-increment ID
- [View Details](./modules/user/README.md)

#### 🎭 Role Module
- **Purpose**: Role-based access control
- **Key Features**: Permission management, role assignment, access rules
- **APIs**: 4 endpoints
- **Schemas**: Role with permissions array
- [View Details](./modules/role/README.md)

#### 🏢 Organization Module
- **Purpose**: Multi-tenant organization management
- **Key Features**: Organization CRUD, settings, subscription plans
- **APIs**: 7 endpoints
- **Schemas**: Organization with settings
- [View Details](./modules/organization/README.md)

### HR Management Modules

#### 👔 Employee Module
- **Purpose**: Comprehensive employee lifecycle management
- **Key Features**: Personal info, employment details, onboarding/offboarding, documents
- **APIs**: 5+ endpoints
- **Schemas**: Employee with extensive fields
- [View Details](./modules/employee/README.md)

#### 🏬 Department Module
- **Purpose**: Organizational structure management
- **Key Features**: Department CRUD, budget tracking, headcount
- **APIs**: 7 endpoints
- **Schemas**: Department
- [View Details](./modules/department/README.md)

#### 🎯 Recruitment Module
- **Purpose**: Talent acquisition and hiring
- **Key Features**: Job postings, candidate pipeline, interviews, offers
- **APIs**: 10+ endpoints
- **Schemas**: Job, Candidate
- [View Details](./modules/recruitment/README.md)

### Time & Attendance Modules

#### ⏰ Attendance Module
- **Purpose**: Time tracking and attendance management
- **Key Features**: Clock in/out, shifts, overtime, GPS tracking
- **APIs**: 15+ endpoints
- **Schemas**: AttendanceRecord, Shift, OvertimeRecord, AttendanceReport
- [View Details](./modules/attendance/README.md)

#### 🏖️ Leave Module
- **Purpose**: Leave request and policy management
- **Key Features**: Leave applications, balance tracking, approvals, holidays
- **APIs**: 12 endpoints
- **Schemas**: LeaveRequest, LeavePolicy, LeaveBalance, Holiday, LeaveType
- [View Details](./modules/leave/README.md)

### Financial Modules

#### 💵 Payroll Module
- **Purpose**: Salary processing and compensation management
- **Key Features**: Payroll cycles, payslips, tax calculations, deductions
- **APIs**: 12+ endpoints
- **Schemas**: PayrollCycle, Payslip, PayrollTax, PayrollReport
- [View Details](./modules/payroll/README.md)

#### 💼 Finance Module
- **Purpose**: Financial transactions and accounting
- **Key Features**: Transactions, accounts, budgets, financial reports
- **APIs**: 15+ endpoints
- **Schemas**: Transaction, Account, Budget, FinancialReport
- [View Details](./modules/finance/README.md)

#### 💸 Expense Module
- **Purpose**: Expense claims and reimbursements
- **Key Features**: Claim submission, receipt OCR, approvals, payouts
- **APIs**: 16 endpoints
- **Schemas**: ExpenseClaim, Receipt, ExpensePolicy
- [View Details](./modules/expense/README.md)

### Specialized Modules

#### 🏥 Healthcare Module
- **Purpose**: Healthcare-specific HR operations
- **Key Features**: Credential tracking, HIPAA compliance, clinical workflows, audit logs
- **APIs**: 23 endpoints
- **Schemas**: 9 specialized schemas
- [View Details](./modules/healthcare/README.md)

### Support Modules

#### 🎫 Helpdesk Module
- **Purpose**: IT support and ticketing system
- **Key Features**: Ticket creation, assignment, resolution tracking
- **APIs**: 8+ endpoints
- **Schemas**: Ticket
- [View Details](./modules/helpdesk/README.md)

#### 📦 Asset Module
- **Purpose**: Company asset management
- **Key Features**: Asset tracking, assignments, maintenance, depreciation
- **APIs**: 18 endpoints
- **Schemas**: Asset, AssetAssignmentHistory, AssetMaintenanceSchedule, AssetDisposal, AssetReport
- [View Details](./modules/asset/README.md)

## 🔄 Data Flow Diagram

```
User Request
    │
    ▼
┌─────────────────┐
│  Express Router │ Route matching
└────────┬────────┘
    │
    ▼
┌─────────────────┐
│  Middleware     │ Authentication & Authorization
└────────┬────────┘
    │
    ▼
┌─────────────────┐
│  Controller     │ Request handling
└────────┬────────┘
    │
    ▼
┌─────────────────┐
│   Service       │ Business logic
└────────┬────────┘
    │
    ▼
┌─────────────────┐
│  Mongoose Model │ Database operations
└────────┬────────┘
    │
    ▼
┌─────────────────┐
│    MongoDB      │ Data storage
└─────────────────┘
```

## 🗄️ Database Schema Relationships

```
Organization (1) ────────(M) Employee
    │                           │
    │                           │
    ├──────(M) Department       │
    │                           │
    ├──────(M) Payroll Cycle    │
    │                           │
    ├──────(M) Leave Request ───┘
    │
    └──────(M) Asset

User (1) ────────(1) Employee
    │
    ├──────(M) Role
    │
    └──────(M) Auth Tokens

Employee (M) ──────(M) Attendance
    │
    ├──────(M) Leave Balance
    │
    ├──────(M) Payslip
    │
    └──────(M) Expense Claim
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (v4+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configurations

# Start the server
npm start
```

### Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your-secret-key
```

## 📚 API Documentation

Once the server is running, access the Swagger documentation at:
- **URL**: `http://localhost:3000/api-docs`

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication:

1. **Register**: Create a new user account
2. **Login**: Get access token
3. **Protected Routes**: Include token in Authorization header
   ```
   Authorization: Bearer <token>
   ```

## 🎭 Roles & Permissions

### Available Roles
- **Super Admin**: Full system access
- **Client Admin**: Organization-level administration
- **HR Account Manager**: HR operations management
- **Payroll Specialist**: Payroll processing
- **Recruitment Specialist**: Hiring operations
- **Employee**: Basic access
- And more...

### Permission Model
Permissions follow the pattern: `resource:action`
- Resources: user, payroll, recruitment, reports, role
- Actions: read, write, delete, export, manage

## 📊 Module Statistics

| Module | Schemas | APIs | Purpose |
|--------|---------|------|---------|
| Auth | 1 | 3 | Authentication |
| User | 1 | 6 | User management |
| Role | 1 | 4 | Access control |
| Organization | 1 | 7 | Multi-tenancy |
| Employee | 1 | 5+ | Employee data |
| Department | 1 | 7 | Org structure |
| Attendance | 4 | 15+ | Time tracking |
| Leave | 5 | 12 | Leave management |
| Payroll | 4 | 12+ | Compensation |
| Finance | 4 | 15+ | Accounting |
| Expense | 3 | 16 | Reimbursements |
| Healthcare | 9 | 23 | Clinical HR |
| Helpdesk | 1 | 8+ | IT support |
| Asset | 5 | 18 | Asset tracking |
| Recruitment | 2 | 10+ | Hiring |

**Total**: ~170+ API endpoints across 15 modules

## 🏛️ Project Structure

```
hrms-server/
├── modules/              # Feature modules
│   ├── auth/
│   ├── user/
│   ├── role/
│   ├── organization/
│   ├── employee/
│   ├── department/
│   ├── attendance/
│   ├── leave/
│   ├── payroll/
│   ├── finance/
│   ├── expense/
│   ├── healthcare/
│   ├── helpdesk/
│   ├── asset/
│   └── recruitment/
├── middleware/           # Express middleware
│   └── authMiddleware.js
├── models/              # Shared models
│   └── counter.model.js
├── constants/           # App constants
├── index.js             # Application entry
├── package.json
├── PROJECT_STRUCTURE.md # Architecture details
└── QUICK_REFERENCE.md   # Developer guide
```

## 📖 Additional Documentation

- [Project Structure](./PROJECT_STRUCTURE.md) - Detailed architecture
- [Quick Reference](./QUICK_REFERENCE.md) - Developer guide
- [Module READMEs](./modules/) - Individual module documentation

## 🤝 Contributing

1. Follow the existing module structure
2. Maintain code consistency
3. Write comprehensive documentation
4. Test all endpoints
5. Update relevant READMEs

## 📝 License

[Specify your license here]

## 👥 Team

[Specify your team information]

---

For detailed information about each module, refer to the individual module README files in the `modules/` directory.
