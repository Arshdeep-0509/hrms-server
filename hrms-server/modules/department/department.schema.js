const mongoose = require('mongoose');
const Counter = require('../../models/counter.model');

const DepartmentSchema = new mongoose.Schema({
  department_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  manager: {
    // Reference to User who manages this department
    type: Number, // user_id
    required: false
  },
  budget: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active'
  },
  headCount: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    trim: true
  },
  // Additional metadata
  metadata: {
    color: String, // For UI purposes
    icon: String,   // For UI purposes
  }
}, { 
  timestamps: true,
  _id: false  // Disable default _id field
});

// Pre-save hook to generate auto-incrementing department_id
DepartmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.department_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'department_id',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true, lean: true }
      );
      this.department_id = counter.sequence_value;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Indexes for better query performance
DepartmentSchema.index({ organization_id: 1 });
DepartmentSchema.index({ status: 1 });
DepartmentSchema.index({ manager: 1 });

module.exports = mongoose.model('Department', DepartmentSchema);

