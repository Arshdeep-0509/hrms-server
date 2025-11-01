# Department Module

## Overview
The Department module manages organizational departments within companies, providing structure and organization for employees.

## Purpose
This module creates a hierarchical structure for organizing employees and tracking department-level metrics like budget and headcount.

## File Structure
```
department/
├── department.schema.js    # Department database model
├── department.service.js   # Business logic
├── department.controller.js # Request handlers
├── department.routes.js    # API endpoints
└── README.md               # This file
```

## Schema: Department Model

### Fields
- **department_id** (Number, unique) - Auto-incrementing ID
- **organization_id** (Number, required) - Parent organization
- **name** (String, required) - Department name
- **description** (String) - Department description
- **manager** (Number) - user_id of department manager
- **budget** (Number, default: 0) - Department budget
- **status** (String, enum) - Active, Inactive, Archived
- **headCount** (Number, default: 0) - Number of employees
- **location** (String) - Physical location
- **metadata** (Object) - Additional info (color, icon)

### Auto-Generated Fields
- `department_id` - Via Counter model
- `createdAt`, `updatedAt` - Timestamps

## Service Methods

### `listDepartments(organizationId, filters)`
List all departments with optional filters.

### `getDepartmentById(departmentId)`
Get detailed department information.

### `createDepartment(deptData)`
Create a new department.

### `updateDepartment(departmentId, updateData)`
Update department information.

### `deleteDepartment(departmentId)`
Delete a department (only if no employees).

## API Endpoints

- `GET /api/departments` - List departments
- `GET /api/departments/:id` - Get department details
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department
- `POST /api/departments/:id/roles` - Create role in department
- `POST /api/departments/:id/assign-user` - Assign employee

## Related Modules
- **Organization** - Parent organization
- **Employee** - Department members
- **User** - Department managers
