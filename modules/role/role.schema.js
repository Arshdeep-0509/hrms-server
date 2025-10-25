const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  role_id: {
    type: String,
    unique: true,
    default: function() {
      return new mongoose.Types.ObjectId().toString();
    }
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
}, { timestamps: true });

module.exports = mongoose.model('Role', RoleSchema);

