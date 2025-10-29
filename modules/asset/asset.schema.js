const mongoose = require('mongoose');
const Counter = require('../../models/counter.model');

// Asset Schema
const AssetSchema = new mongoose.Schema({
  asset_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  assetCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  assetName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'IT Equipment',
      'Furniture',
      'Office Equipment',
      'Vehicles',
      'Machinery',
      'Tools',
      'Electronics',
      'Appliances',
      'Other'
    ]
  },
  subCategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    default: 'USD'
  },
  supplier: {
    name: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  location: {
    building: {
      type: String,
      trim: true
    },
    floor: {
      type: String,
      trim: true
    },
    room: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['Available', 'Assigned', 'In Maintenance', 'Lost', 'Damaged', 'Disposed', 'Retired'],
    default: 'Available'
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'],
    default: 'Good'
  },
  assignedTo: {
    type: {
      type: String,
      enum: ['Employee', 'Department'],
      required: false
    },
    employee_id: {
      type: Number,
      ref: 'Employee',
      required: false
    },
    department_id: {
      type: Number,
      ref: 'Department',
      required: false
    },
    assignedDate: {
      type: Date,
      required: false
    },
    assignedBy: {
      type: Number, // user_id
      required: false
    }
  },
  warranty: {
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    provider: {
      type: String,
      trim: true
    },
    terms: {
      type: String,
      trim: true
    }
  },
  depreciation: {
    method: {
      type: String,
      enum: ['Straight Line', 'Declining Balance', 'Sum of Years', 'Units of Production'],
      default: 'Straight Line'
    },
    usefulLife: {
      type: Number, // in years
      default: 5
    },
    residualValue: {
      type: Number,
      default: 0
    },
    currentValue: {
      type: Number
    },
    depreciationRate: {
      type: Number
    }
  },
  maintenance: {
    lastMaintenanceDate: {
      type: Date
    },
    nextMaintenanceDate: {
      type: Date
    },
    maintenanceInterval: {
      type: Number, // in days
      default: 90
    },
    maintenanceNotes: {
      type: String,
      trim: true
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  qrCode: {
    type: String,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  documents: [{
    name: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    uploadedDate: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Number, // user_id
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  _id: false
});

// Asset Assignment History Schema
const AssetAssignmentHistorySchema = new mongoose.Schema({
  history_id: {
    type: Number,
    unique: true
  },
  asset_id: {
    type: Number,
    required: true,
    ref: 'Asset'
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  action: {
    type: String,
    enum: ['Assigned', 'Returned', 'Transferred', 'Maintenance', 'Lost', 'Damaged', 'Disposed'],
    required: true
  },
  from: {
    type: {
      type: String,
      enum: ['Employee', 'Department', 'Unassigned'],
      required: false
    },
    employee_id: {
      type: Number,
      ref: 'Employee',
      required: false
    },
    department_id: {
      type: Number,
      ref: 'Department',
      required: false
    }
  },
  to: {
    type: {
      type: String,
      enum: ['Employee', 'Department', 'Unassigned'],
      required: false
    },
    employee_id: {
      type: Number,
      ref: 'Employee',
      required: false
    },
    department_id: {
      type: Number,
      ref: 'Department',
      required: false
    }
  },
  actionDate: {
    type: Date,
    default: Date.now
  },
  actionBy: {
    type: Number, // user_id
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'],
    required: false
  }
}, {
  timestamps: true,
  _id: false
});

// Asset Maintenance Schedule Schema
const AssetMaintenanceScheduleSchema = new mongoose.Schema({
  schedule_id: {
    type: Number,
    unique: true
  },
  asset_id: {
    type: Number,
    required: true,
    ref: 'Asset'
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  maintenanceType: {
    type: String,
    enum: ['Preventive', 'Corrective', 'Emergency', 'Routine', 'Inspection'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Overdue'],
    default: 'Scheduled'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  assignedTo: {
    type: Number, // user_id
    required: true
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number,
    default: 0
  },
  vendor: {
    name: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    }
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Number, // user_id
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: Number, // in days
    required: function() {
      return this.isRecurring;
    }
  }
}, {
  timestamps: true,
  _id: false
});

// Asset Disposal Schema
const AssetDisposalSchema = new mongoose.Schema({
  disposal_id: {
    type: Number,
    unique: true
  },
  asset_id: {
    type: Number,
    required: true,
    ref: 'Asset'
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  disposalType: {
    type: String,
    enum: ['Sale', 'Donation', 'Recycling', 'Destruction', 'Trade-in', 'Lost', 'Stolen'],
    required: true
  },
  disposalDate: {
    type: Date,
    required: true
  },
  disposalValue: {
    type: Number,
    default: 0
  },
  disposalReason: {
    type: String,
    required: true,
    trim: true
  },
  disposedBy: {
    type: Number, // user_id
    required: true
  },
  approvedBy: {
    type: Number, // user_id
    required: true
  },
  buyer: {
    name: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  disposalMethod: {
    type: String,
    trim: true
  },
  disposalLocation: {
    type: String,
    trim: true
  },
  certificateNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  documents: [{
    name: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Completed', 'Cancelled'],
    default: 'Pending'
  }
}, {
  timestamps: true,
  _id: false
});

// Asset Report Schema
const AssetReportSchema = new mongoose.Schema({
  report_id: {
    type: Number,
    unique: true
  },
  asset_id: {
    type: Number,
    required: true,
    ref: 'Asset'
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  reportType: {
    type: String,
    enum: ['Lost', 'Damaged', 'Stolen', 'Found', 'Malfunction'],
    required: true
  },
  reportedBy: {
    type: Number, // user_id
    required: true
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  assignedTo: {
    type: Number, // user_id
    required: false
  },
  resolution: {
    type: String,
    trim: true
  },
  resolvedBy: {
    type: Number, // user_id
    required: false
  },
  resolvedDate: {
    type: Date
  },
  images: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  _id: false
});

// Pre-save hooks for auto-incrementing IDs
AssetSchema.pre('save', async function(next) {
  if (this.isNew && !this.asset_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'asset_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.asset_id = counter.sequence_value;
      
      // Generate asset code if not provided
      if (!this.assetCode) {
        this.assetCode = `AST-${String(this.asset_id).padStart(6, '0')}`;
      }
      
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

AssetAssignmentHistorySchema.pre('save', async function(next) {
  if (this.isNew && !this.history_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'asset_history_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.history_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

AssetMaintenanceScheduleSchema.pre('save', async function(next) {
  if (this.isNew && !this.schedule_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'asset_maintenance_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.schedule_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

AssetDisposalSchema.pre('save', async function(next) {
  if (this.isNew && !this.disposal_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'asset_disposal_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.disposal_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

AssetReportSchema.pre('save', async function(next) {
  if (this.isNew && !this.report_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'asset_report_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.report_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

// Create models
const Asset = mongoose.model('Asset', AssetSchema);
const AssetAssignmentHistory = mongoose.model('AssetAssignmentHistory', AssetAssignmentHistorySchema);
const AssetMaintenanceSchedule = mongoose.model('AssetMaintenanceSchedule', AssetMaintenanceScheduleSchema);
const AssetDisposal = mongoose.model('AssetDisposal', AssetDisposalSchema);
const AssetReport = mongoose.model('AssetReport', AssetReportSchema);

module.exports = {
  Asset,
  AssetAssignmentHistory,
  AssetMaintenanceSchedule,
  AssetDisposal,
  AssetReport
};
