const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Counter = require('../../models/counter.model');

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
    type: Number,
    unique: true
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
}, { 
  timestamps: true,
  _id: false  // Disable default _id field
});

// Pre-save hook to handle both ID generation and password hashing
UserSchema.pre('save', async function(next) {
  // Generate auto-incrementing user_id for new documents
  if (this.isNew && !this.user_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'user_id',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true, lean: true }
      );
      this.user_id = counter.sequence_value;
    } catch (error) {
      return next(error);
    }
  }

  // Hash password if it's been modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(8); // Reduced from 10 to 8 for better performance
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }
  
  next();
});

// Instance method to compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  // Must use a query that explicitly selects the password field to use this method
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

