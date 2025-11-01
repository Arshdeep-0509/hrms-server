# Role Module

## Overview
The Role module manages user roles and permissions for access control throughout the HRMS system.

## Purpose
This module defines what actions each role can perform and provides a flexible permission-based access control system.

## File Structure
```
role/
├── role.schema.js     # Role database model
├── role.service.js    # Business logic for role operations
├── role.controller.js # HTTP request handlers
├── role.routes.js     # API endpoint definitions
└── README.md          # This file
```

## Schema: Role Model

### Fields
- **role_id** (Number, unique) - Auto-incrementing numeric ID
- **name** (String, required, unique) - Role name
- **permissions** (Array) - List of permission strings

### Permissions Available
- `user:read` - Read user data
- `user:write` - Create/update users
- `user:delete` - Delete users
- `payroll:read` - Read payroll data
- `payroll:write` - Create/update payroll
- `recruitment:read` - Read recruitment data
- `recruitment:write` - Create/update recruitment
- `reports:read` - Read reports
- `reports:export` - Export reports
- `role:manage` - Manage roles

### Auto-Generated Fields
- `role_id` - Auto-incremented via Counter model
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## Service Methods

### `getAllRoles()`
Retrieves all roles with their permissions.
- **Returns**: Array of role objects
- **Use**: Display available roles and permissions

### `updateUserRole(userId, newRole)`
Updates a user's role.
- **Parameters**: userId, newRole
- **Returns**: Success message
- **Throws**: User not found, invalid role

### `getRoleAccessRules(roleName)`
Gets detailed access rules for a specific role.
- **Parameters**: roleName
- **Returns**: Role object with permissions

## API Endpoints

### Role Management Routes
- `GET /api/roles/` - Get all roles and permissions (Super Admin only)
- `PATCH /api/roles/update-user-role` - Update user role (Admin only)
- `GET /api/roles/:roleName` - Get role access rules (Super Admin only)
- `PATCH /api/roles/:roleName/access` - Modify role permissions (Super Admin only)

## Usage Examples

### Get All Roles
```javascript
// In controller
const roles = await roleService.getAllRoles();
```

### Update User Role
```javascript
// In controller
const result = await roleService.updateUserRole(
  req.body.userId,
  req.body.newRole
);
```

### Get Role Permissions
```javascript
// In controller
const role = await roleService.getRoleAccessRules('Employee');
```

## Permission System
Permissions use a resource:action pattern (e.g., `user:read`, `payroll:write`).

### Resource Types
- `user` - User management
- `payroll` - Payroll operations
- `recruitment` - Recruitment operations
- `reports` - Report generation
- `role` - Role management

### Actions
- `read` - View data
- `write` - Create/update data
- `delete` - Remove data
- `export` - Export data
- `manage` - Full control

## Integration
- Used by Auth middleware for authorization
- Linked to User module for role assignment
- Integrated with all protected routes

## Dependencies
- `mongoose` - Database ODM
- `../../models/counter.model` - Auto-increment counter

## Related Modules
- **User Module**: Roles assigned to users
- **Auth Module**: Permission checking
- **Middleware**: Authorization enforcement
