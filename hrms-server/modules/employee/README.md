# Employee Module

## Overview
The Employee module manages comprehensive employee information including personal details, employment history, compensation, and onboarding/offboarding processes.

## Purpose
This module serves as the central hub for all employee-related data, linking users to organizations and managing the complete employee lifecycle.

## File Structure
```
employee/
├── employee.schema.js     # Employee database model
├── employee.service.js    # Business logic
├── employee.controller.js # Request handlers
├── employee.routes.js     # API endpoints
└── README.md              # This file
```

## Schema: Employee Model

### Key Fields
- **employee_id** (Number, unique) - Numeric ID
- **user_id** (Number, required) - Links to User
- **organization_id** (Number, required) - Links to Organization
- **role_id** (Number, required) - Links to Role
- **department_id** (Number, required) - Department assignment

### Personal Information
- firstName, lastName, email, phone
- dateOfBirth, gender, address
- emergencyContact

### Employment Information
- position, department, employmentType
- employmentStatus (Active, Inactive, On Leave, etc.)
- hireDate, terminationDate

### Compensation
- salary (amount, currency, payFrequency)
- benefits array

### Documents
- Uploaded documents (Resume, ID, Contract, etc.)
- Document type, name, URL, uploadedAt

### Onboarding/Offboarding
- Task tracking with status
- Completion dates
- Assigned users

## Service Methods
- `listEmployees()` - Get all employees
- `getEmployeeById()` - Get employee details
- `createEmployee()` - Add new employee
- `updateEmployee()` - Update employee info
- `deleteEmployee()` - Remove employee

## API Endpoints
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

## Related Modules
- **User** - Authentication credentials
- **Organization** - Parent company
- **Department** - Organizational unit
- **Role** - Position/role definition
