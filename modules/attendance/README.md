# Attendance Module

## Overview
The Attendance module tracks employee work hours, clock-in/clock-out, overtime, and attendance patterns.

## Purpose
Manage time tracking, shift schedules, overtime calculations, and generate attendance reports for payroll and compliance.

## File Structure
```
attendance/
├── attendance.schema.js     # Database models
├── attendance.service.js    # Business logic
├── attendance.controller.js # Request handlers
├── attendance.routes.js     # API endpoints
└── README.md                # This file
```

## Schemas

### AttendanceRecord
- Clock-in/out timestamps and locations
- Work hours calculations (regular, overtime)
- Status (Present, Absent, Late, etc.)
- Device information
- Leave integration

### Shift
- Shift name, timing (start/end)
- Break durations
- Working days
- Overtime rules and rates

### OvertimeRecord
- Overtime hours and type
- Pay calculations
- Approval workflow

### AttendanceReport
- Report generation with filters
- Employee/department breakdowns
- Attendance statistics

## Key Features
- GPS-based location tracking
- Multiple clock methods (Mobile, Web, Biometric)
- Automatic overtime calculation
- Shift scheduling
- Leave integration

## API Endpoints
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out
- `GET /api/attendance/records` - View records
- `POST /api/attendance/shifts` - Create shift
- `GET /api/attendance/reports` - Generate reports

## Related Modules
- **Employee** - Employee details
- **Leave** - Leave tracking
- **Payroll** - Hours for payroll
