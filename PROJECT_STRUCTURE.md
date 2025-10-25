# HRMS Server - Project Structure

## Overview
This project has been restructured into a modular architecture where each feature has its own directory containing schema, service, controller, and routes.

## Directory Structure

```
hrms-server/
├── modules/
│   ├── auth/
│   │   ├── auth.service.js      # Authentication business logic
│   │   ├── auth.controller.js   # Auth request handlers
│   │   └── auth.routes.js       # Auth API routes
│   │
│   ├── user/
│   │   ├── user.schema.js       # User mongoose model
│   │   ├── user.service.js      # User business logic
│   │   ├── user.controller.js   # User request handlers
│   │   └── user.routes.js       # User API routes
│   │
│   ├── role/
│   │   ├── role.schema.js       # Role mongoose model
│   │   ├── role.service.js      # Role business logic
│   │   ├── role.controller.js   # Role request handlers
│   │   └── role.routes.js       # Role API routes
│   │
│   └── organization/
│       ├── organization.schema.js    # Organization mongoose model
│       ├── organization.service.js   # Organization business logic
│       ├── organization.controller.js # Organization request handlers
│       └── organization.routes.js    # Organization API routes
│
├── middleware/
│   └── authMiddleware.js        # Authentication & Authorization middleware
│
├── index.js                     # Application entry point
├── package.json
└── .env                         # Environment variables
```

## Architecture Layers

### 1. **Schema Layer** (`*.schema.js`)
- Defines Mongoose models
- Contains database schema definitions
- Includes validation rules and hooks
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
- Example: `user.routes.js` defines `/api/users/*` endpoints

## Module Descriptions

### Auth Module
Handles user authentication:
- Register new users
- Login with JWT tokens
- Logout functionality
- Token generation and validation

### User Module
Manages user profiles:
- Get user profile
- Update user profile (name, email, password)
- Delete users (admin only)

### Role Module
Manages roles and permissions:
- List all roles and permissions
- Update user roles
- Get role access rules
- Modify role permissions dynamically

### Organization Module
Manages client organizations:
- List all organizations
- Create new organizations
- Get organization details
- Update organization info
- Delete organizations
- Configure HR/payroll policies
- Assign HR account managers

## Benefits of This Structure

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Maintainability**: Easy to locate and update specific functionality
3. **Scalability**: Simple to add new modules following the same pattern
4. **Testability**: Services can be unit tested independently
5. **Reusability**: Business logic in services can be reused across controllers
6. **Clean Code**: Controllers stay thin, focusing only on request/response handling

## API Endpoints

### Auth Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user (protected)

### User Routes (`/api/users`)
- `GET /profile` - Get current user profile (protected)
- `PATCH /profile` - Update current user profile (protected)
- `DELETE /:id` - Delete user by ID (admin only)

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

## Adding New Modules

To add a new module, follow this pattern:

1. Create a new directory in `modules/`
2. Add the following files:
   - `<module>.schema.js` - Mongoose model
   - `<module>.service.js` - Business logic
   - `<module>.controller.js` - Request handlers
   - `<module>.routes.js` - Route definitions
3. Import and register routes in `index.js`

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

