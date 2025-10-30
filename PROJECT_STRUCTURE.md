# HRMS Server - Project Structure

## Overview
This project has been restructured into a modular architecture where each feature has its own directory containing schema, service, controller, and routes. The system now includes 15 comprehensive modules covering all aspects of HR management.

## Directory Structure

```
hrms-server/
├── modules/
│   ├── auth/
│   │   ├── auth.service.js      # Authentication business logic
│   │   ├── auth.controller.js   # Auth request handlers
│   │   ├── auth.routes.js       # Auth API routes
│   │   └── README.md            # Module documentation
│   │
│   ├── user/
│   │   ├── user.schema.js       # User mongoose model
│   │   ├── user.service.js      # User business logic
│   │   ├── user.controller.js   # User request handlers
│   │   ├── user.routes.js       # User API routes
│   │   └── README.md            # Module documentation
│   │
│   ├── role/
│   │   ├── role.schema.js       # Role mongoose model
│   │   ├── role.service.js      # Role business logic
│   │   ├── role.controller.js   # Role request handlers
│   │   ├── role.routes.js       # Role API routes
│   │   └── README.md            # Module documentation
│   │
│   ├── organization/
│   │   ├── organization.schema.js    # Organization mongoose model
│   │   ├── organization.service.js   # Organization business logic
│   │   ├── organization.controller.js # Organization request handlers
│   │   ├── organization.routes.js    # Organization API routes
│   │   └── README.md                 # Module documentation
│   │
│   ├── employee/
│   │   ├── employee.schema.js    # Employee mongoose model
│   │   ├── employee.service.js   # Employee business logic
│   │   ├── employee.controller.js # Employee request handlers
│   │   ├── employee.routes.js    # Employee API routes
│   │   └── README.md             # Module documentation
│   │
│   ├── department/
│   │   ├── department.schema.js    # Department mongoose model
│   │   ├── department.service.js   # Department business logic
│   │   ├── department.controller.js # Department request handlers
│   │   ├── department.routes.js    # Department API routes
│   │   └── README.md               # Module documentation
│   │
│   ├── attendance/
│   │   ├── attendance.schema.js    # Attendance models (4 schemas)
│   │   ├── attendance.service.js   # Attendance business logic
│   │   ├── attendance.controller.js # Attendance request handlers
│   │   ├── attendance.routes.js    # Attendance API routes
│   │   └── README.md               # Module documentation
│   │
│   ├── leave/
│   │   ├── leave.schema.js    # Leave models (5 schemas)
│   │   ├── leave.service.js   # Leave business logic
│   │   ├── leave.controller.js # Leave request handlers
│   │   ├── leave.routes.js    # Leave API routes
│   │   └── README.md          # Module documentation
│   │
│   ├── payroll/
│   │   ├── payroll.schema.js    # Payroll models (4 schemas)
│   │   ├── payroll.service.js   # Payroll business logic
│   │   ├── payroll.controller.js # Payroll request handlers
│   │   ├── payroll.routes.js    # Payroll API routes
│   │   └── README.md            # Module documentation
│   │
│   ├── finance/
│   │   ├── finance.schema.js    # Finance models
│   │   ├── finance.service.js   # Finance business logic
│   │   ├── finance.controller.js # Finance request handlers
│   │   ├── finance.routes.js    # Finance API routes
│   │   └── README.md            # Module documentation
│   │
│   ├── expense/
│   │   ├── expense.schema.js    # Expense models (3 schemas)
│   │   ├── expense.service.js   # Expense business logic
│   │   ├── expense.controller.js # Expense request handlers
│   │   ├── expense.routes.js    # Expense API routes
│   │   └── README.md            # Module documentation
│   │
│   ├── recruitment/
│   │   ├── recruitment.schema.js    # Recruitment models
│   │   ├── recruitment.service.js   # Recruitment business logic
│   │   ├── recruitment.controller.js # Recruitment request handlers
│   │   ├── recruitment.routes.js    # Recruitment API routes
│   │   └── README.md                # Module documentation
│   │
│   ├── healthcare/
│   │   ├── healthcare.schema.js    # Healthcare models (9 schemas)
│   │   ├── healthcare.service.js   # Healthcare business logic
│   │   ├── healthcare.controller.js # Healthcare request handlers
│   │   ├── healthcare.routes.js    # Healthcare API routes
│   │   └── README.md               # Module documentation
│   │
│   ├── helpdesk/
│   │   ├── helpdesk.schema.js    # Helpdesk models
│   │   ├── helpdesk.service.js   # Helpdesk business logic
│   │   ├── helpdesk.controller.js # Helpdesk request handlers
│   │   ├── helpdesk.routes.js    # Helpdesk API routes
│   │   └── README.md             # Module documentation
│   │
│   └── asset/
│       ├── asset.schema.js    # Asset models (5 schemas)
│       ├── asset.service.js   # Asset business logic
│       ├── asset.controller.js # Asset request handlers
│       ├── asset.routes.js    # Asset API routes
│       └── README.md          # Module documentation
│
├── models/
│   └── counter.model.js        # Shared Counter model for auto-increment IDs
│
├── middleware/
│   └── authMiddleware.js        # Authentication & Authorization middleware
│
├── constants/                   # Application constants
│
├── swagger/                     # Swagger/OpenAPI configuration
│   └── swagger.config.js
│
├── index.js                     # Application entry point
├── package.json
├── .env                         # Environment variables
├── README.md                    # Main project documentation
├── PROJECT_STRUCTURE.md         # This file
└── QUICK_REFERENCE.md           # Developer quick reference
```

## Architecture Layers

### 1. **Schema Layer** (`*.schema.js`)
- Defines Mongoose models
- Contains database schema definitions
- Includes validation rules and hooks
- Pre-save hooks for auto-incrementing IDs
- Example: `user.schema.js` defines User model with password hashing

### 2. **Service Layer** (`*.service.js`)
- Contains all business logic
- Handles data manipulation and validation
- Interacts with database models
- Throws structured errors with status codes
- Reusable across different controllers
- Example: `user.service.js` contains methods like `getUserProfile()`, `updateUserProfile()`

### 3. **Controller Layer** (`*.controller.js`)
- Handles HTTP requests and responses
- Calls service layer methods
- Manages error handling and response formatting
- Keeps code thin - delegates logic to services
- Example: `user.controller.js` handles route logic

### 4. **Routes Layer** (`*.routes.js`)
- Defines API endpoints
- Applies middleware (authentication, authorization)
- Maps routes to controller methods
- Includes Swagger/OpenAPI documentation
- Example: `user.routes.js` defines `/api/users/*` endpoints

## Module Descriptions

### Core Modules

#### Auth Module
Handles user authentication:
- Register new users
- Login with JWT tokens
- Logout functionality
- Token generation and validation

#### User Module
Manages user profiles:
- Get user profile
- Update user profile (name, email, password)
- Delete users (admin only)
- List users with filters
- Create users (admin only)

#### Role Module
Manages roles and permissions:
- List all roles and permissions
- Update user roles
- Get role access rules
- Modify role permissions dynamically

#### Organization Module
Manages client organizations:
- List all organizations
- Create new organizations
- Get organization details
- Update organization info
- Delete organizations
- Configure HR/payroll policies
- Assign HR account managers

### HR Management Modules

#### Employee Module
Comprehensive employee management:
- Employee CRUD operations
- Personal and employment information
- Onboarding and offboarding workflows
- Document management
- Status history tracking

#### Department Module
Organizational structure management:
- Create and manage departments
- Track department budgets and headcount
- Assign managers
- Create department-specific roles
- Assign employees to departments

#### Recruitment Module
Talent acquisition:
- Job opening management
- Candidate pipeline tracking
- Interview scheduling
- Offer management
- Onboarding integration

### Time & Attendance Modules

#### Attendance Module
Time tracking:
- Clock in/out with location tracking
- Shift scheduling
- Overtime calculation
- Attendance reports
- Integration with payroll

#### Leave Module
Leave management:
- Leave request submission
- Approval workflows
- Leave balance tracking
- Policy management
- Holiday calendar
- Reports and analytics

### Financial Modules

#### Payroll Module
Salary processing:
- Payroll cycle management
- Payslip generation
- Tax calculations
- Deductions tracking
- Payroll reports

#### Finance Module
Financial management:
- Transaction recording
- Account management
- Budget tracking
- Financial reports
- Multi-currency support

#### Expense Module
Expense claims:
- Claim submission
- Receipt upload and OCR
- Approval workflows
- Reimbursement processing
- Policy enforcement
- Expense analytics

### Specialized Modules

#### Healthcare Module
Healthcare-specific HR:
- Medical staff recruitment
- Credential tracking
- HIPAA compliance
- Clinical workflows
- Audit logs
- Shift-based payroll

#### Helpdesk Module
IT support:
- Ticket creation
- Agent assignment
- Resolution tracking
- Priority management
- SLA tracking

#### Asset Module
Asset management:
- Asset registration
- Assignment tracking
- Maintenance scheduling
- Depreciation calculations
- QR/barcode scanning
- Disposal management

## Benefits of This Structure

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Maintainability**: Easy to locate and update specific functionality
3. **Scalability**: Simple to add new modules following the same pattern
4. **Testability**: Services can be unit tested independently
5. **Reusability**: Business logic in services can be reused across controllers
6. **Clean Code**: Controllers stay thin, focusing only on request/response handling
7. **Documentation**: Each module has its own README for easy understanding
8. **Team Collaboration**: Multiple developers can work on different modules simultaneously

## API Endpoints Overview

### Auth Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user (protected)

### User Routes (`/api/users`)
- `GET /profile` - Get current user profile (protected)
- `PATCH /profile` - Update current user profile (protected)
- `GET /` - List all users (admin)
- `POST /` - Create new user (admin)
- `PATCH /:id` - Update user (admin)
- `DELETE /:user_id` - Delete user (admin)

### Role Routes (`/api/roles`)
- `GET /` - Get all roles and permissions (super admin only)
- `PATCH /update-user-role` - Update user role (admin only)
- `GET /:roleName` - Get role access rules (super admin only)
- `PATCH /:roleName/access` - Modify role permissions (super admin only)

### Organization Routes (`/api/organizations`)
- `GET /` - List all organizations
- `POST /` - Create new organization (super admin only)
- `GET /:id` - Get organization details
- `PUT /:id` - Update organization (super admin only)
- `DELETE /:id` - Delete organization (super admin only)
- `PUT /:id/settings` - Configure policies (client admin only)
- `POST /:id/assign-account-manager` - Assign HR manager (super admin only)

### Additional Modules
Each module has its own set of endpoints. See individual module READMEs for complete endpoint documentation.

## Adding New Modules

To add a new module, follow this pattern:

1. Create a new directory in `modules/`
2. Add the following files:
   - `<module>.schema.js` - Mongoose model
   - `<module>.service.js` - Business logic
   - `<module>.controller.js` - Request handlers
   - `<module>.routes.js` - Route definitions
   - `README.md` - Module documentation
3. Import and register routes in `index.js`
4. Update `PROJECT_STRUCTURE.md` and `QUICK_REFERENCE.md`

Example for a new "Department" module:
```javascript
// In index.js
const departmentRoutes = require('./modules/department/department.routes');
app.use('/api/departments', departmentRoutes);
```

## Environment Variables

Required in `.env` file:
- `PORT` - Server port number
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env` file

3. Start the server:
   ```bash
   npm start
   ```

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Swagger/OpenAPI** - API documentation

## Module Statistics

- **Total Modules**: 15
- **Total Schemas**: 45+
- **Total API Endpoints**: 170+
- **Multi-tenant Support**: Yes
- **Role-based Access Control**: Yes
- **Auto-incrementing IDs**: Yes
- **Comprehensive Documentation**: Yes

## Documentation

- **Main README**: [README.md](./README.md) - Overview and getting started
- **Project Structure**: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - This file
- **Quick Reference**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Developer guide
- **Module READMEs**: See individual module directories for detailed documentation
- **API Documentation**: Swagger UI at `/api-docs` when server is running