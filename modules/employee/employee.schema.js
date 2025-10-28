const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  employee_id: {
    type: Number,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  user_id: {
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
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
  },
  role_id: {
    type: Number,
    required: true,
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  profilePhoto_url: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String,
  },
  
  // Employment Information
  position: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  department_id: {
    type: Number,
    required: true,
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Intern', 'Temporary'],
    required: true,
  },
  employmentStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave', 'Terminated', 'Resigned'],
    default: 'Active',
  },
  hireDate: {
    type: Date,
    required: true,
  },
  terminationDate: {
    type: Date,
  },
  terminationReason: {
    type: String,
    enum: ['Resignation', 'Termination', 'Retirement', 'Contract End', 'Other'],
  },
  terminationNotes: String,
  
  // Compensation
  salary: {
    amount: Number,
    currency: {
      type: String,
      enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
      default: 'INR',
    },
    payFrequency: {
      type: String,
      enum: ['Weekly', 'Bi-weekly', 'Monthly', 'Annually'],
    },
  },
  benefits: [{
    type: String,
  }],
  
  // Work Details
  workLocation: {
    type: String,
    required: true,
    trim: true,
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  manager_id: {
    type: Number,
  },
  
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['Resume', 'ID', 'Contract', 'License', 'Certificate', 'Other'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  
  // Onboarding
  onboardingStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  onboardingStartDate: Date,
  onboardingCompletedDate: Date,
  onboardingTasks: [{
    task: String,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: Date,
    notes: String,
  }],
  
  // Offboarding
  offboardingStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  offboardingStartDate: Date,
  offboardingCompletedDate: Date,
  offboardingTasks: [{
    task: String,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: Date,
    notes: String,
  }],
  
  // Additional Information
  notes: String,
  tags: [{
    type: String,
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
  statusHistory: [{
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave', 'Terminated', 'Resigned'],
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
  }],
}, { timestamps: true });

// Indexes for better query performance
// Note: employee_id and email already have indexes due to unique: true
EmployeeSchema.index({ user: 1 });
EmployeeSchema.index({ organization: 1 });
EmployeeSchema.index({ employmentStatus: 1 });
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ createdAt: -1 });

const Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = Employee;
