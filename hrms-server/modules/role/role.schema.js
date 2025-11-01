const mongoose = require('mongoose');
const Counter = require('../../models/counter.model');

const RoleSchema = new mongoose.Schema({
  role_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  // permissions is an array of strings defining resource access
  permissions: [{ 
    type: String,
    enum: [
      'user:read', 'user:write', 'user:delete', // User management
      'payroll:read', 'payroll:write',         // Payroll
      'recruitment:read', 'recruitment:write', // Recruitment
      'reports:read', 'reports:export',         // Reporting
      'role:manage'                             // Role management
    ]
  }]
}, { 
  timestamps: true,
  _id: false  // Disable default _id field
});

// Pre-save hook to generate auto-incrementing role_id
RoleSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'role_id' },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    this.role_id = counter.sequence_value;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Role', RoleSchema);

