const mongoose = require('mongoose');
const Counter = require('../../models/counter.model');

// Leave Request Schema
const LeaveRequestSchema = new mongoose.Schema({
  leave_id: {
    type: Number,
    unique: true
  },
  employee_id: {
    type: Number,
    required: true,
    ref: 'Employee'
  },
  organization_id: {
    type: Number,
    required: true
  },
  leave_type_id: {
    type: Number,
    required: true,
    ref: 'LeaveType'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  approvedBy: {
    type: Number, // user_id
    required: false
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  _id: false
});

// Leave Policy Schema
const LeavePolicySchema = new mongoose.Schema({
  policy_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true
  },
  leave_type_id: {
    type: Number,
    required: true,
    ref: 'LeaveType'
  },
  maxDays: {
    type: Number,
    required: true
  },
  carryForward: {
    type: Boolean,
    default: false
  },
  maxCarryForwardDays: {
    type: Number,
    default: 0
  },
  requiresApproval: {
    type: Boolean,
    default: true
  },
  minNoticeDays: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  _id: false
});

// Leave Balance Schema
const LeaveBalanceSchema = new mongoose.Schema({
  balance_id: {
    type: Number,
    unique: true
  },
  employee_id: {
    type: Number,
    required: true,
    ref: 'Employee'
  },
  organization_id: {
    type: Number,
    required: true
  },
  leave_type_id: {
    type: Number,
    required: true,
    ref: 'LeaveType'
  },
  totalAllocated: {
    type: Number,
    default: 0
  },
  used: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  carryForward: {
    type: Number,
    default: 0
  },
  year: {
    type: Number,
    required: true
  }
}, { 
  timestamps: true,
  _id: false
});

// Holiday Schema
const HolidaySchema = new mongoose.Schema({
  holiday_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['National', 'Regional', 'Organization', 'Optional'],
    default: 'Organization'
  },
  recurring: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true,
  _id: false
});

// Leave Type Schema
const LeaveTypeSchema = new mongoose.Schema({
  leave_type_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  isPaid: {
    type: Boolean,
    default: true
  },
  maxLimit: {
    type: Number,
    required: true
  },
  carryForward: {
    type: Boolean,
    default: false
  },
  maxCarryForward: {
    type: Number,
    default: 0
  },
  requiresApproval: {
    type: Boolean,
    default: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  _id: false
});

// Pre-save hooks for auto-incrementing IDs
LeaveRequestSchema.pre('save', async function(next) {
  if (this.isNew && !this.leave_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'leave_id',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true, lean: true }
      );
      this.leave_id = counter.sequence_value;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

LeavePolicySchema.pre('save', async function(next) {
  if (this.isNew && !this.policy_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'leave_policy_id',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true, lean: true }
      );
      this.policy_id = counter.sequence_value;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

LeaveBalanceSchema.pre('save', async function(next) {
  if (this.isNew && !this.balance_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'leave_balance_id',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true, lean: true }
      );
      this.balance_id = counter.sequence_value;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

HolidaySchema.pre('save', async function(next) {
  if (this.isNew && !this.holiday_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'holiday_id',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true, lean: true }
      );
      this.holiday_id = counter.sequence_value;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

LeaveTypeSchema.pre('save', async function(next) {
  if (this.isNew && !this.leave_type_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'leave_type_id',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true, lean: true }
      );
      this.leave_type_id = counter.sequence_value;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Indexes
LeaveRequestSchema.index({ employee_id: 1 });
LeaveRequestSchema.index({ organization_id: 1 });
LeaveRequestSchema.index({ status: 1 });
LeaveRequestSchema.index({ startDate: 1, endDate: 1 });

LeavePolicySchema.index({ organization_id: 1 });
LeavePolicySchema.index({ leave_type_id: 1 });

LeaveBalanceSchema.index({ employee_id: 1 });
LeaveBalanceSchema.index({ organization_id: 1 });
LeaveBalanceSchema.index({ year: 1 });

HolidaySchema.index({ organization_id: 1 });
HolidaySchema.index({ date: 1 });

LeaveTypeSchema.index({ organization_id: 1 });
LeaveTypeSchema.index({ code: 1 });

// Create models
const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);
const LeavePolicy = mongoose.model('LeavePolicy', LeavePolicySchema);
const LeaveBalance = mongoose.model('LeaveBalance', LeaveBalanceSchema);
const Holiday = mongoose.model('Holiday', HolidaySchema);
const LeaveType = mongoose.model('LeaveType', LeaveTypeSchema);

module.exports = {
  LeaveRequest,
  LeavePolicy,
  LeaveBalance,
  Holiday,
  LeaveType
};

