# 🕒 Attendance Management Module

## Overview

The Attendance Management module provides comprehensive attendance tracking capabilities for the HRMS system. It handles clock in/out operations, shift management, overtime tracking, and detailed reporting functionality.

## Features

- **Clock In/Out Management**: Record employee check-in and check-out times
- **Shift Management**: Create and manage work shifts with flexible timing
- **Overtime Tracking**: Automatic overtime calculation and approval workflows
- **Comprehensive Reporting**: Generate various attendance reports and trends
- **Location Tracking**: Optional GPS-based attendance verification
- **Device Management**: Track attendance methods and device information
- **Role-based Access Control**: Secure access based on user roles

## Database Schema

### AttendanceRecord
Manages individual attendance records for employees.

```javascript
{
  attendance_id: Number,           // Unique attendance identifier
  employee: ObjectId,             // Employee reference
  employee_id: Number,            // Employee ID
  organization: ObjectId,         // Organization reference
  organization_id: Number,        // Organization ID
  
  // Clock In/Out Information
  clockIn: {
    timestamp: Date,              // Clock in time
    location: {                   // GPS location
      latitude: Number,
      longitude: Number,
      address: String
    },
    deviceInfo: {                 // Device information
      deviceId: String,
      platform: String,
      userAgent: String
    },
    method: String,               // Clock in method
    notes: String                 // Additional notes
  },
  
  clockOut: {
    timestamp: Date,              // Clock out time
    location: {                   // GPS location
      latitude: Number,
      longitude: Number,
      address: String
    },
    deviceInfo: {                 // Device information
      deviceId: String,
      platform: String,
      userAgent: String
    },
    method: String,               // Clock out method
    notes: String                 // Additional notes
  },
  
  // Work Details
  workDate: Date,                // Work date
  shift: ObjectId,               // Shift reference
  shift_id: Number,              // Shift ID
  
  // Time Calculations
  totalHours: Number,            // Total hours worked
  regularHours: Number,          // Regular hours
  overtimeHours: Number,         // Overtime hours
  breakTime: Number,             // Break time
  
  // Status and Approval
  status: String,                // Present, Absent, Late, etc.
  isApproved: Boolean,           // Approval status
  approvedBy: ObjectId,          // Approver reference
  approvedAt: Date,              // Approval timestamp
  approvalNotes: String,         // Approval notes
  
  // Leave Integration
  leaveRequest: ObjectId,        // Leave request reference
  leaveType: String,             // Type of leave
  
  // Additional Information
  notes: String,                 // Additional notes
  attachments: [{                // File attachments
    name: String,
    url: String,
    type: String,
    uploadedAt: Date
  }],
  
  // Tracking
  createdBy: ObjectId,           // Creator reference
  updatedBy: ObjectId            // Last updater reference
}
```

### Shift
Manages work shifts and schedules.

```javascript
{
  shift_id: Number,              // Unique shift identifier
  organization: ObjectId,        // Organization reference
  organization_id: Number,       // Organization ID
  name: String,                  // Shift name
  description: String,           // Shift description
  
  // Shift Timing
  startTime: String,             // Start time (HH:MM)
  endTime: String,               // End time (HH:MM)
  duration: Number,              // Shift duration in hours
  
  // Break Information
  breakDuration: Number,         // Total break duration
  breakTimes: [{                 // Break periods
    startTime: String,
    endTime: String,
    duration: Number,
    name: String
  }],
  
  // Working Days
  workingDays: [String],         // Days of the week
  
  // Overtime Rules
  overtimeRules: {
    enabled: Boolean,            // Overtime enabled
    dailyOvertimeThreshold: Number, // Daily overtime threshold
    weeklyOvertimeThreshold: Number, // Weekly overtime threshold
    overtimeRate: Number,        // Overtime rate multiplier
    doubleTimeRate: Number       // Double time rate multiplier
  },
  
  // Shift Status
  isActive: Boolean,             // Active status
  isDefault: Boolean,            // Default shift
  
  // Additional Information
  notes: String,                 // Additional notes
  
  // Tracking
  createdBy: ObjectId,           // Creator reference
  updatedBy: ObjectId            // Last updater reference
}
```

### OvertimeRecord
Manages overtime calculations and approvals.

```javascript
{
  overtime_id: Number,           // Unique overtime identifier
  employee: ObjectId,            // Employee reference
  employee_id: Number,           // Employee ID
  organization: ObjectId,        // Organization reference
  organization_id: Number,       // Organization ID
  attendanceRecord: ObjectId,    // Attendance record reference
  attendance_id: Number,         // Attendance ID
  
  // Overtime Details
  overtimeDate: Date,            // Overtime date
  overtimeType: String,          // Daily, Weekly, Holiday, etc.
  
  // Time Calculations
  regularHours: Number,          // Regular hours
  overtimeHours: Number,         // Overtime hours
  doubleTimeHours: Number,       // Double time hours
  
  // Rate Information
  regularRate: Number,           // Regular hourly rate
  overtimeRate: Number,          // Overtime hourly rate
  doubleTimeRate: Number,        // Double time hourly rate
  
  // Pay Calculations
  regularPay: Number,            // Regular pay
  overtimePay: Number,           // Overtime pay
  doubleTimePay: Number,         // Double time pay
  totalOvertimePay: Number,      // Total overtime pay
  
  // Approval and Status
  status: String,                // Pending, Approved, Rejected, Paid
  isApproved: Boolean,           // Approval status
  approvedBy: ObjectId,          // Approver reference
  approvedAt: Date,              // Approval timestamp
  approvalNotes: String,         // Approval notes
  
  // Additional Information
  reason: String,                // Overtime reason
  notes: String,                 // Additional notes
  
  // Tracking
  createdBy: ObjectId,           // Creator reference
  updatedBy: ObjectId            // Last updater reference
}
```

### AttendanceReport
Generated attendance reports and analytics.

```javascript
{
  report_id: Number,             // Unique report identifier
  organization: ObjectId,        // Organization reference
  organization_id: Number,       // Organization ID
  
  // Report Details
  reportType: String,            // Daily, Weekly, Monthly, etc.
  reportName: String,            // Report name
  description: String,           // Report description
  
  // Report Period
  reportPeriod: {
    startDate: Date,             // Report start date
    endDate: Date                // Report end date
  },
  
  // Report Data
  reportData: {
    totalEmployees: Number,      // Total employees
    totalWorkingDays: Number,    // Total working days
    totalPresentDays: Number,    // Total present days
    totalAbsentDays: Number,     // Total absent days
    totalLateDays: Number,       // Total late days
    totalOvertimeHours: Number,  // Total overtime hours
    averageHoursPerDay: Number,  // Average hours per day
    attendanceRate: Number,      // Overall attendance rate
    employeeBreakdown: [{        // Employee breakdown
      employeeId: Number,
      employeeName: String,
      presentDays: Number,
      absentDays: Number,
      lateDays: Number,
      totalHours: Number,
      overtimeHours: Number,
      attendanceRate: Number
    }],
    departmentBreakdown: [{      // Department breakdown
      department: String,
      employeeCount: Number,
      totalPresentDays: Number,
      totalAbsentDays: Number,
      averageAttendanceRate: Number
    }],
    dailyBreakdown: [{           // Daily breakdown
      date: Date,
      presentCount: Number,
      absentCount: Number,
      lateCount: Number,
      totalHours: Number
    }]
  },
  
  // Report Configuration
  filters: {
    departments: [String],       // Department filters
    employeeIds: [Number],       // Employee ID filters
    shifts: [Number],            // Shift filters
    statuses: [String]           // Status filters
  },
  
  // Report Status
  status: String,                // Generating, Completed, Failed
  generatedAt: Date,             // Generation timestamp
  reportUrl: String,             // Report download URL
  
  // Additional Information
  notes: String,                 // Additional notes
  
  // Tracking
  createdBy: ObjectId,           // Creator reference
  generatedBy: ObjectId          // Generator reference
}
```

## API Endpoints

### Clock In/Out

| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/attendance/clock-in` | POST | Record employee check-in | All Roles |
| `/api/attendance/clock-out` | POST | Record employee check-out | All Roles |

### Shift Management

| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/attendance/shifts/create` | POST | Create new shift | HR / Client Admin |
| `/api/attendance/shifts` | GET | List all shifts | HR / Client Admin |
| `/api/attendance/shifts/:id` | GET | Get shift by ID | HR / Client Admin |
| `/api/attendance/shifts/:id` | PUT | Update shift | HR / Client Admin |
| `/api/attendance/shifts/:id` | DELETE | Delete shift | HR / Client Admin |

### Overtime Management

| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/attendance/overtime/:id` | GET | Get overtime data for employee | HR / Employee |
| `/api/attendance/overtime/record/:id` | GET | Get overtime record by ID | HR / Employee |
| `/api/attendance/overtime/record/:id` | PUT | Update overtime record | HR / Client Admin |
| `/api/attendance/overtime/record/:id/approve` | PUT | Approve overtime record | HR / Client Admin |

### Reports

| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/attendance/reports` | GET | List attendance reports | HR / Client Admin |
| `/api/attendance/reports` | POST | Generate attendance report | HR / Client Admin |
| `/api/attendance/reports/:id` | GET | Get report by ID | HR / Client Admin |
| `/api/attendance/reports/:id/download` | GET | Download report | HR / Client Admin |

### Attendance Records

| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/attendance/employee/:employeeId` | GET | Get employee attendance records | HR / Employee |
| `/api/attendance/record/:id` | GET | Get attendance record by ID | HR / Employee |
| `/api/attendance/record/:id` | PUT | Update attendance record | HR / Client Admin |
| `/api/attendance/record/:id/approve` | PUT | Approve attendance record | HR / Client Admin |

### Additional APIs

| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/attendance/trends` | GET | Get attendance trends | HR / Client Admin |
| `/api/attendance/summary/today` | GET | Get today's attendance summary | HR / Client Admin |

## Usage Examples

### Clock In

```javascript
POST /api/attendance/clock-in
{
  "employeeId": 101,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York, NY"
  },
  "deviceInfo": {
    "deviceId": "device123",
    "platform": "iOS",
    "userAgent": "Mozilla/5.0..."
  },
  "method": "Mobile App",
  "notes": "Regular clock in"
}
```

### Clock Out

```javascript
POST /api/attendance/clock-out
{
  "employeeId": 101,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York, NY"
  },
  "deviceInfo": {
    "deviceId": "device123",
    "platform": "iOS",
    "userAgent": "Mozilla/5.0..."
  },
  "method": "Mobile App",
  "notes": "Regular clock out"
}
```

### Create Shift

```javascript
POST /api/attendance/shifts/create
{
  "organization_id": 1,
  "name": "Day Shift",
  "description": "Regular day shift",
  "startTime": "09:00",
  "endTime": "17:00",
  "breakDuration": 60,
  "breakTimes": [
    {
      "startTime": "12:00",
      "endTime": "13:00",
      "duration": 60,
      "name": "Lunch Break"
    }
  ],
  "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "overtimeRules": {
    "enabled": true,
    "dailyOvertimeThreshold": 8,
    "weeklyOvertimeThreshold": 40,
    "overtimeRate": 1.5,
    "doubleTimeRate": 2.0
  },
  "notes": "Standard day shift"
}
```

### Generate Attendance Report

```javascript
POST /api/attendance/reports
{
  "reportType": "Monthly",
  "reportName": "January 2024 Attendance Report",
  "description": "Monthly attendance summary",
  "reportPeriod": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "filters": {
    "departments": ["Engineering", "Marketing"],
    "shifts": [1001, 1002],
    "statuses": ["Present", "Late"]
  }
}
```

### Get Overtime Data

```javascript
GET /api/attendance/overtime/101
```

## Access Control

### Role Permissions

- **Super Admin**: Full access to all attendance functions
- **Client Admin**: View and manage attendance for their organization
- **HR Account Manager**: Full attendance management and reporting
- **Employee**: Clock in/out for themselves, view own attendance records

### Security Features

- Organization-based data isolation
- Role-based access control
- Location-based attendance verification (optional)
- Device tracking and validation
- Audit trails for all operations
- Data validation and sanitization

## Business Logic

### Clock In/Out Process

1. **Validation**: Check if employee is already clocked in/out
2. **Location Tracking**: Optional GPS verification
3. **Device Recording**: Track device and method information
4. **Time Calculation**: Calculate total hours worked
5. **Overtime Detection**: Automatically detect overtime hours
6. **Status Update**: Update attendance status based on hours

### Shift Management

1. **Shift Creation**: Define work schedules and timing
2. **Break Configuration**: Set break periods and durations
3. **Overtime Rules**: Configure overtime thresholds and rates
4. **Working Days**: Define which days the shift applies
5. **Assignment**: Assign shifts to employees or departments

### Overtime Calculation

1. **Daily Overtime**: Hours worked beyond daily threshold
2. **Weekly Overtime**: Hours worked beyond weekly threshold
3. **Rate Application**: Apply appropriate overtime rates
4. **Approval Workflow**: Require approval for overtime payments
5. **Integration**: Link with payroll system for payment processing

### Report Generation

1. **Data Collection**: Gather attendance data for specified period
2. **Filtering**: Apply filters for departments, employees, shifts
3. **Calculation**: Calculate attendance rates and statistics
4. **Breakdown**: Generate employee and department breakdowns
5. **Export**: Generate downloadable reports in various formats

## Error Handling

The module includes comprehensive error handling:

- **Validation Errors**: Input validation with detailed messages
- **Authorization Errors**: Access control violations
- **Business Logic Errors**: Attendance processing errors
- **Database Errors**: Data persistence issues
- **File Processing Errors**: Report generation issues

## Performance Considerations

- **Indexing**: Optimized database indexes for fast queries
- **Pagination**: Large dataset handling
- **Caching**: Frequently accessed data caching
- **Background Processing**: Asynchronous report generation
- **Data Archiving**: Historical data management

## Integration Points

- **Employee Module**: Employee data and shift assignments
- **Organization Module**: Organization structure and settings
- **User Module**: User authentication and authorization
- **Payroll Module**: Overtime integration and payment processing
- **Notification System**: Attendance alerts and reminders

## Future Enhancements

- **Biometric Integration**: Fingerprint and face recognition
- **Mobile App**: Dedicated mobile application
- **Geofencing**: Location-based attendance validation
- **Real-time Notifications**: Live attendance updates
- **Advanced Analytics**: Machine learning insights
- **API Integrations**: Third-party time tracking services
- **Compliance Management**: Labor law compliance tracking
- **Workflow Automation**: Automated approval processes
