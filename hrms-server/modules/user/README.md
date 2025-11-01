# User Module

## Overview
The User module manages user profiles, authentication, and user-related operations throughout the HRMS system.

## Purpose
This module handles all user-related operations including profile management, user CRUD operations, and integrates with authentication.

## File Structure
```
user/
├── user.schema.js     # User database model
├── user.service.js    # Business logic for user operations
├── user.controller.js # HTTP request handlers
├── user.routes.js     # API endpoint definitions
└── README.md          # This file
```

## Schema: User Model

### Fields
- **user_id** (Number, unique) - Auto-incrementing numeric ID
- **email** (String, required, unique) - User email with validation
- **password** (String, required) - Hashed password (not returned by default)
- **role** (String, required, enum) - User role from ROLES array
- **name** (String, required) - User's full name
- **timestamps** - Auto-generated createdAt and updatedAt

### Auto-Generated Fields
- `user_id` - Auto-incremented via Counter model
- `password` - Auto-hashed with bcrypt before saving
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Pre-Save Hook
Automatically generates `user_id` and hashes password when creating/updating users.

### Instance Methods
- `matchPassword(enteredPassword)` - Compares password with hashed version

## Service Methods

### `getUserProfile(userId)`
Retrieves user profile by ID.
- **Returns**: User object (without password)
- **Throws**: User not found

### `updateUserProfile(userId, updateData)`
Updates user profile information.
- **Parameters**: userId, updateData (name, email, etc.)
- **Returns**: Updated user object
- **Throws**: User not found, email already exists

### `deleteUser(userId)`
Deletes a user account.
- **Parameters**: userId
- **Returns**: Success message
- **Throws**: User not found

### `listUsers(filters)`
Lists all users with optional filters.
- **Parameters**: Filters object (role, organization, etc.)
- **Returns**: Array of user objects

### `createUser(userData)`
Creates a new user (admin only).
- **Parameters**: User data object
- **Returns**: Created user object
- **Throws**: Email already exists, validation errors

### `updateUser(userId, updateData)`
Updates user information (admin only).
- **Parameters**: userId, updateData
- **Returns**: Updated user object
- **Throws**: User not found

## API Endpoints

### User Profile Routes (Protected)
- `GET /api/users/profile` - Get current user's profile
- `PATCH /api/users/profile` - Update current user's profile

### User Management Routes (Admin Only)
- `GET /api/users/` - List all users
- `POST /api/users/` - Create new user
- `PATCH /api/users/:id` - Update user by ID
- `DELETE /api/users/:user_id` - Delete user by ID

## User Roles
Supported roles in the system:
- Super Admin
- Client Admin
- HR Account Manager
- Payroll Specialist
- Recruitment Specialist
- Bookkeeper
- Healthcare HR Specialist
- Employee
- Client Manager
- Auditor

## Usage Examples

### Get User Profile
```javascript
// In controller
const user = await userService.getUserProfile(req.user.user_id);
```

### Update User Profile
```javascript
// In controller
const updatedUser = await userService.updateUserProfile(
  req.user.user_id,
  { name: 'John Doe', email: 'john@example.com' }
);
```

### List Users by Role
```javascript
// In service
const users = await userService.listUsers({ role: 'Employee' });
```

## Security Features
1. **Password Protection**: Not returned in queries by default
2. **Numeric IDs**: Uses custom numeric user_id instead of MongoDB _id
3. **Password Hashing**: Automatic hashing with bcrypt
4. **Email Validation**: Regex pattern validation
5. **Role-Based Access**: Integration with authorization middleware

## Dependencies
- `mongoose` - Database ODM
- `bcryptjs` - Password hashing
- `../../models/counter.model` - Auto-increment counter

## Related Modules
- **Auth Module**: Uses User schema for authentication
- **Role Module**: Manages user roles and permissions
- **Organization Module**: Links users to organizations

## Best Practices
1. Never return password in API responses
2. Always validate email format
3. Use numeric IDs consistently
4. Hash passwords before saving
5. Implement proper authorization checks
