# Leave Management Module

## Overview
The Leave Management module handles employee leave requests, balances, policies, and approvals.

## Purpose
Streamline leave application processes, track leave balances, enforce policies, and generate leave reports.

## File Structure
```
leave/
├── leave.schema.js       # Database models
├── leave.service.js      # Business logic
├── leave.controller.js   # Request handlers
├── leave.routes.js       # API endpoints
└── README.md             # This file
```

## Schemas

### LeaveRequest
- leave_id, employee_id, organization_id
- leave_type_id, startDate, endDate
- days, reason, status
- approvedBy, approvedAt, rejectionReason

### LeavePolicy
- policy_id, organization_id
- leave_type_id, maxDays
- carryForward settings
- approval requirements

### LeaveBalance
- balance_id, employee_id
- leave_type_id, year
- totalAllocated, used, balance
- carryForward days

### Holiday
- holiday_id, organization_id
- name, date, type
- recurring flag

### LeaveType
- leave_type_id, organization_id
- name, code, isPaid
- maxLimit, carryForward rules

## API Endpoints (12 APIs)
- `POST /api/leave/apply` - Apply for leave
- `PUT /api/leave/approve/:id` - Approve/reject
- `POST /api/leave/policy/create` - Create policy
- `GET /api/leave/balance/:employeeId` - Get balance
- `GET /api/leave/reports` - Leave reports
- `POST /api/leave/holidays/add` - Add holiday
- `GET /api/leave/holidays/list` - List holidays
- `GET /api/leave/calendar` - Calendar view
- `POST /api/leave/type/create` - Create leave type
- `GET /api/leave/type/list` - List leave types
- `PUT /api/leave/type/update/:id` - Update type

## Features
- Multiple leave types
- Balance tracking
- Policy enforcement
- Approval workflows
- Calendar integration
- Holiday management

## Related Modules
- **Employee** - Employee data
- **Attendance** - Leave integration
- **Payroll** - Leave deductions
