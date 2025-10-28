const mongoose = require('mongoose');

// Attendance Record Schema
const AttendanceRecordSchema = new mongoose.Schema({
  attendance_id: {
    type: Number,
    required: true,
    unique: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  employee_id: {
    type: Number,
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  organization_id: {
    type: Number,
    required: true,
  },
  
  // Clock In/Out Information
  clockIn: {
    timestamp: {
      type: Date,
      required: true,
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    deviceInfo: {
      deviceId: String,
      platform: String,
      userAgent: String,
    },
    method: {
      type: String,
      enum: ['Mobile App', 'Web Portal', 'Biometric', 'Card', 'Manual'],
      default: 'Mobile App',
    },
    notes: String,
  },
  
  clockOut: {
    timestamp: Date,
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    deviceInfo: {
      deviceId: String,
      platform: String,
      userAgent: String,
    },
    method: {
      type: String,
      enum: ['Mobile App', 'Web Portal', 'Biometric', 'Card', 'Manual'],
      default: 'Mobile App',
    },
    notes: String,
  },
  
  // Work Details
  workDate: {
    type: Date,
    required: true,
  },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
  },
  shift_id: {
    type: Number,
  },
  
  // Time Calculations
  totalHours: {
    type: Number,
    default: 0,
  },
  regularHours: {
    type: Number,
    default: 0,
  },
  overtimeHours: {
    type: Number,
    default: 0,
  },
  breakTime: {
    type: Number,
    default: 0,
  },
  
  // Status and Approval
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half Day', 'On Leave', 'Holiday', 'Weekend'],
    default: 'Present',
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  approvalNotes: String,
  
  // Leave Integration
  leaveRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveRequest',
  },
  leaveType: {
    type: String,
    enum: ['Sick Leave', 'Personal Leave', 'Vacation', 'Emergency', 'Other'],
  },
  
  // Additional Information
  notes: String,
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Shift Schema
const ShiftSchema = new mongoose.Schema({
  shift_id: {
    type: Number,
    required: true,
    unique: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  organization_id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  
  // Shift Timing
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format'
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format'
    }
  },
  duration: {
    type: Number,
    required: true,
  },
  
  // Break Information
  breakDuration: {
    type: Number,
    default: 0,
  },
  breakTimes: [{
    startTime: String,
    endTime: String,
    duration: Number,
    name: String,
  }],
  
  // Working Days
  workingDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  }],
  
  // Overtime Rules
  overtimeRules: {
    enabled: {
      type: Boolean,
      default: true,
    },
    dailyOvertimeThreshold: {
      type: Number,
      default: 8,
    },
    weeklyOvertimeThreshold: {
      type: Number,
      default: 40,
    },
    overtimeRate: {
      type: Number,
      default: 1.5,
    },
    doubleTimeRate: {
      type: Number,
      default: 2.0,
    },
  },
  
  // Shift Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  
  // Additional Information
  notes: String,
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Overtime Record Schema
const OvertimeRecordSchema = new mongoose.Schema({
  overtime_id: {
    type: Number,
    required: true,
    unique: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  employee_id: {
    type: Number,
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  organization_id: {
    type: Number,
    required: true,
  },
  attendanceRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttendanceRecord',
    required: true,
  },
  attendance_id: {
    type: Number,
    required: true,
  },
  
  // Overtime Details
  overtimeDate: {
    type: Date,
    required: true,
  },
  overtimeType: {
    type: String,
    enum: ['Daily', 'Weekly', 'Holiday', 'Weekend', 'Emergency'],
    required: true,
  },
  
  // Time Calculations
  regularHours: {
    type: Number,
    required: true,
  },
  overtimeHours: {
    type: Number,
    required: true,
  },
  doubleTimeHours: {
    type: Number,
    default: 0,
  },
  
  // Rate Information
  regularRate: {
    type: Number,
    required: true,
  },
  overtimeRate: {
    type: Number,
    required: true,
  },
  doubleTimeRate: {
    type: Number,
    default: 0,
  },
  
  // Pay Calculations
  regularPay: {
    type: Number,
    required: true,
  },
  overtimePay: {
    type: Number,
    required: true,
  },
  doubleTimePay: {
    type: Number,
    default: 0,
  },
  totalOvertimePay: {
    type: Number,
    required: true,
  },
  
  // Approval and Status
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending',
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  approvalNotes: String,
  
  // Additional Information
  reason: String,
  notes: String,
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Attendance Report Schema
const AttendanceReportSchema = new mongoose.Schema({
  report_id: {
    type: Number,
    required: true,
    unique: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  organization_id: {
    type: Number,
    required: true,
  },
  
  // Report Details
  reportType: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Custom', 'Employee Summary', 'Department Summary'],
    required: true,
  },
  reportName: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  
  // Report Period
  reportPeriod: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  
  // Report Data
  reportData: {
    totalEmployees: Number,
    totalWorkingDays: Number,
    totalPresentDays: Number,
    totalAbsentDays: Number,
    totalLateDays: Number,
    totalOvertimeHours: Number,
    averageHoursPerDay: Number,
    attendanceRate: Number,
    employeeBreakdown: [{
      employeeId: Number,
      employeeName: String,
      presentDays: Number,
      absentDays: Number,
      lateDays: Number,
      totalHours: Number,
      overtimeHours: Number,
      attendanceRate: Number,
    }],
    departmentBreakdown: [{
      department: String,
      employeeCount: Number,
      totalPresentDays: Number,
      totalAbsentDays: Number,
      averageAttendanceRate: Number,
    }],
    dailyBreakdown: [{
      date: Date,
      presentCount: Number,
      absentCount: Number,
      lateCount: Number,
      totalHours: Number,
    }],
  },
  
  // Report Configuration
  filters: {
    departments: [String],
    employeeIds: [Number],
    shifts: [Number],
    statuses: [String],
  },
  
  // Report Status
  status: {
    type: String,
    enum: ['Generating', 'Completed', 'Failed'],
    default: 'Generating',
  },
  generatedAt: Date,
  reportUrl: String,
  
  // Additional Information
  notes: String,
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Indexes for better query performance
AttendanceRecordSchema.index({ attendance_id: 1 });
AttendanceRecordSchema.index({ employee: 1 });
AttendanceRecordSchema.index({ organization: 1 });
AttendanceRecordSchema.index({ workDate: -1 });
AttendanceRecordSchema.index({ status: 1 });
AttendanceRecordSchema.index({ 'clockIn.timestamp': -1 });

ShiftSchema.index({ shift_id: 1 });
ShiftSchema.index({ organization: 1 });
ShiftSchema.index({ isActive: 1 });
ShiftSchema.index({ isDefault: 1 });

OvertimeRecordSchema.index({ overtime_id: 1 });
OvertimeRecordSchema.index({ employee: 1 });
OvertimeRecordSchema.index({ organization: 1 });
OvertimeRecordSchema.index({ overtimeDate: -1 });
OvertimeRecordSchema.index({ status: 1 });

AttendanceReportSchema.index({ report_id: 1 });
AttendanceReportSchema.index({ organization: 1 });
AttendanceReportSchema.index({ reportType: 1 });
AttendanceReportSchema.index({ generatedAt: -1 });

// Create models
const AttendanceRecord = mongoose.model('AttendanceRecord', AttendanceRecordSchema);
const Shift = mongoose.model('Shift', ShiftSchema);
const OvertimeRecord = mongoose.model('OvertimeRecord', OvertimeRecordSchema);
const AttendanceReport = mongoose.model('AttendanceReport', AttendanceReportSchema);

module.exports = {
  AttendanceRecord,
  Shift,
  OvertimeRecord,
  AttendanceReport,
};
