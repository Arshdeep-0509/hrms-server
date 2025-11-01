const mongoose = require('mongoose');
const Counter = require('../../models/counter.model');

// Optimized unified Asset Schema with embedded subdocuments
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
  // Basic Information
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
    enum: ['IT Equipment', 'Furniture', 'Office Equipment', 'Vehicles', 'Machinery', 'Tools', 'Electronics', 'Appliances', 'Other']
  },
  subCategory: { type: String, trim: true },
  brand: { type: String, trim: true },
  model: { type: String, trim: true },
  serialNumber: { type: String, trim: true },
  description: { type: String, trim: true },
  
  // Purchase Information
  purchaseDate: { type: Date, required: true },
  purchasePrice: { type: Number, required: true },
  currency: {
    type: String,
    enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    default: 'USD'
  },
  supplier: {
    name: { type: String, trim: true },
    contact: { type: String, trim: true },
    address: { type: String, trim: true }
  },
  
  // Location
  location: {
    building: { type: String, trim: true },
    floor: { type: String, trim: true },
    room: { type: String, trim: true },
    address: { type: String, trim: true }
  },
  
  // Status & Assignment
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
    type: { type: String, enum: ['Employee', 'Department'] },
    employee_id: { type: Number, ref: 'Employee' },
    department_id: { type: Number, ref: 'Department' },
    assignedDate: { type: Date },
    assignedBy: { type: Number }
  },
  
  // Warranty
  warranty: {
    startDate: { type: Date },
    endDate: { type: Date },
    provider: { type: String, trim: true },
    terms: { type: String, trim: true }
  },
  
  // Depreciation
  depreciation: {
    method: {
      type: String,
      enum: ['Straight Line', 'Declining Balance', 'Sum of Years', 'Units of Production'],
      default: 'Straight Line'
    },
    usefulLife: { type: Number, default: 5 },
    residualValue: { type: Number, default: 0 },
    currentValue: { type: Number },
    depreciationRate: { type: Number }
  },
  
  // Maintenance Info
  maintenance: {
    lastMaintenanceDate: { type: Date },
    nextMaintenanceDate: { type: Date },
    maintenanceInterval: { type: Number, default: 90 },
    maintenanceNotes: { type: String, trim: true }
  },
  
  // Embedded: Assignment History
  history: [{
    action: {
      type: String,
      enum: ['Assigned', 'Returned', 'Transferred', 'Maintenance', 'Lost', 'Damaged', 'Disposed'],
      required: true
    },
    from: {
      type: { type: String, enum: ['Employee', 'Department', 'Unassigned'] },
      employee_id: { type: Number, ref: 'Employee' },
      department_id: { type: Number, ref: 'Department' }
    },
    to: {
      type: { type: String, enum: ['Employee', 'Department', 'Unassigned'] },
      employee_id: { type: Number, ref: 'Employee' },
      department_id: { type: Number, ref: 'Department' }
    },
    actionDate: { type: Date, default: Date.now },
    actionBy: { type: Number, required: true },
    reason: { type: String, trim: true },
    notes: { type: String, trim: true },
    condition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'] }
  }],
  
  // Embedded: Maintenance Schedules
  maintenanceSchedules: [{
    maintenanceType: {
      type: String,
      enum: ['Preventive', 'Corrective', 'Emergency', 'Routine', 'Inspection'],
      required: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
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
    assignedTo: { type: Number, required: true },
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },
    vendor: {
      name: { type: String, trim: true },
      contact: { type: String, trim: true }
    },
    notes: { type: String, trim: true },
    createdBy: { type: Number, required: true },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: { type: Number }
  }],
  
  // Embedded: Disposal Records
  disposal: {
    disposalType: { type: String, enum: ['Sale', 'Donation', 'Recycling', 'Destruction', 'Trade-in', 'Lost', 'Stolen'] },
    disposalDate: { type: Date },
    disposalValue: { type: Number, default: 0 },
    disposalReason: { type: String, trim: true },
    disposedBy: { type: Number },
    approvedBy: { type: Number },
    buyer: {
      name: { type: String, trim: true },
      contact: { type: String, trim: true },
      address: { type: String, trim: true }
    },
    disposalMethod: { type: String, trim: true },
    disposalLocation: { type: String, trim: true },
    certificateNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    documents: [{
      name: { type: String, required: true },
      path: { type: String, required: true },
      type: { type: String, required: true }
    }],
    notes: { type: String, trim: true }
  },
  
  // Embedded: Reports
  reports: [{
    reportType: {
      type: String,
      enum: ['Lost', 'Damaged', 'Stolen', 'Found', 'Malfunction'],
      required: true
    },
    reportedBy: { type: Number, required: true },
    reportDate: { type: Date, default: Date.now },
    description: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
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
    assignedTo: { type: Number },
    resolution: { type: String, trim: true },
    resolvedBy: { type: Number },
    resolvedDate: { type: Date },
    images: [{ type: String, trim: true }],
    notes: { type: String, trim: true }
  }],
  
  // Additional Fields
  tags: [{ type: String, trim: true }],
  qrCode: { type: String, trim: true },
  barcode: { type: String, trim: true },
  images: [{ type: String, trim: true }],
  documents: [{
    name: { type: String, required: true },
    path: { type: String, required: true },
    type: { type: String, required: true },
    uploadedDate: { type: Date, default: Date.now }
  }],
  notes: { type: String, trim: true },
  
  // Metadata
  createdBy: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  _id: false
});

// Pre-save hook for auto-incrementing asset_id
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

// Create model
const Asset = mongoose.model('Asset', AssetSchema);

module.exports = { Asset };
