const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = [
  'Super Admin',
  'Client Admin',
  'HR Account Manager',
  'Payroll Specialist',
  'Recruitment Specialist',
  'Bookkeeper',
  'Healthcare HR Specialist',
  'Employee',
  'Client Manager',
  'Auditor'
];

const UserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true,
    default: function() {
      return new mongoose.Types.ObjectId().toString();
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Optimization: do not return password by default
  },
  role: {
    type: String,
    required: true,
    enum: ROLES,
    default: 'Employee' // Set a secure default
  },
  name: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Pre-save hook to hash password (Optimization: use a common salt round count)
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  // Must use a query that explicitly selects the password field to use this method
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

