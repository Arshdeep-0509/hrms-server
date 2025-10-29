const mongoose = require('mongoose');
const Counter = require('../../models/counter.model');

// Healthcare Recruitment Schema
const HealthcareRecruitmentSchema = new mongoose.Schema({
  recruitment_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  specialty: {
    type: String,
    required: true,
    trim: true // e.g., Cardiology, Emergency Medicine, Nursing
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Per Diem', 'Locum Tenens'],
    required: true
  },
  shiftType: {
    type: String,
    enum: ['Day', 'Night', 'Rotating', 'On-call', 'Weekend'],
    required: true
  },
  requiredCredentials: [{
    credentialType: {
      type: String,
      required: true
    },
    isRequired: {
      type: Boolean,
      default: true
    }
  }],
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Expert'],
    required: true
  },
  salaryRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
      default: 'USD'
    }
  },
  benefits: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['Open', 'Closed', 'On Hold', 'Draft', 'Filled'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  applicationDeadline: {
    type: Date
  },
  hiringManager: {
    type: Number, // user_id
    required: true
  },
  totalApplications: {
    type: Number,
    default: 0
  },
  selectedCandidates: [{
    candidate_id: {
      type: String,
      required: true
    },
    selectedDate: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String
    }
  }],
  complianceNotes: {
    type: String,
    trim: true
  },
  hipaaTrainingRequired: {
    type: Boolean,
    default: true
  },
  backgroundCheckRequired: {
    type: Boolean,
    default: true
  },
  drugTestRequired: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  _id: false
});

// Healthcare Credentials Schema
const HealthcareCredentialsSchema = new mongoose.Schema({
  credential_id: {
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
    required: true,
    ref: 'Organization'
  },
  credentialType: {
    type: String,
    required: true,
    enum: [
      'Medical License',
      'Nursing License',
      'Specialty Certification',
      'DEA License',
      'Board Certification',
      'CPR Certification',
      'ACLS Certification',
      'PALS Certification',
      'BLS Certification',
      'HIPAA Training',
      'Other'
    ]
  },
  credentialName: {
    type: String,
    required: true,
    trim: true
  },
  issuingAuthority: {
    type: String,
    required: true,
    trim: true
  },
  credentialNumber: {
    type: String,
    required: true,
    trim: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  renewalDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Suspended', 'Revoked', 'Pending Renewal'],
    default: 'Active'
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date
  },
  verifiedBy: {
    type: Number // user_id
  },
  documentPath: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  autoRenewal: {
    type: Boolean,
    default: false
  },
  reminderDays: {
    type: Number,
    default: 30 // Days before expiration to send reminder
  },
  lastReminderSent: {
    type: Date
  },
  complianceStatus: {
    type: String,
    enum: ['Compliant', 'Non-Compliant', 'At Risk', 'Under Review'],
    default: 'Compliant'
  }
}, {
  timestamps: true,
  _id: false
});

// Healthcare Shifts Schema
const HealthcareShiftsSchema = new mongoose.Schema({
  shift_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  department_id: {
    type: Number,
    ref: 'Department'
  },
  shiftName: {
    type: String,
    required: true,
    trim: true
  },
  shiftType: {
    type: String,
    enum: ['Day', 'Night', 'Evening', 'On-call', 'Weekend', 'Holiday'],
    required: true
  },
  startTime: {
    type: String,
    required: true,
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  },
  endTime: {
    type: String,
    required: true,
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  },
  duration: {
    type: Number,
    required: true // in hours
  },
  workingDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  isRotating: {
    type: Boolean,
    default: false
  },
  rotationPattern: {
    type: String,
    trim: true
  },
  breakDuration: {
    type: Number,
    default: 30 // in minutes
  },
  overtimeRules: {
    dailyThreshold: {
      type: Number,
      default: 8
    },
    weeklyThreshold: {
      type: Number,
      default: 40
    },
    overtimeRate: {
      type: Number,
      default: 1.5
    },
    doubleTimeRate: {
      type: Number,
      default: 2.0
    }
  },
  requiredStaffing: {
    minimum: {
      type: Number,
      required: true
    },
    maximum: {
      type: Number,
      required: true
    },
    specialties: [{
      specialty: {
        type: String,
        required: true
      },
      count: {
        type: Number,
        required: true
      }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Number, // user_id
    required: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  _id: false
});

// Healthcare Shift Assignment Schema
const HealthcareShiftAssignmentSchema = new mongoose.Schema({
  assignment_id: {
    type: Number,
    unique: true
  },
  shift_id: {
    type: Number,
    required: true,
    ref: 'HealthcareShift'
  },
  employee_id: {
    type: Number,
    required: true,
    ref: 'Employee'
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  assignedDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show', 'Late'],
    default: 'Scheduled'
  },
  clockInTime: {
    type: Date
  },
  clockOutTime: {
    type: Date
  },
  actualHours: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  breakTime: {
    type: Number,
    default: 0 // in minutes
  },
  notes: {
    type: String,
    trim: true
  },
  assignedBy: {
    type: Number, // user_id
    required: true
  },
  isOvertime: {
    type: Boolean,
    default: false
  },
  payrollCalculated: {
    type: Boolean,
    default: false
  },
  payrollAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  _id: false
});

// Healthcare Policies Schema
const HealthcarePoliciesSchema = new mongoose.Schema({
  policy_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  policyName: {
    type: String,
    required: true,
    trim: true
  },
  policyType: {
    type: String,
    enum: [
      'HIPAA Compliance',
      'Patient Safety',
      'Clinical Protocols',
      'Emergency Procedures',
      'Staff Training',
      'Quality Assurance',
      'Infection Control',
      'Medication Management',
      'Documentation Standards',
      'Other'
    ],
    required: true
  },
  version: {
    type: String,
    required: true,
    default: '1.0'
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  expirationDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Archived', 'Under Review', 'Superseded'],
    default: 'Draft'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    trim: true
  },
  applicableRoles: [{
    type: String,
    enum: ['All', 'Super Admin', 'Client Admin', 'HR Account Manager', 'Employee', 'Nurse', 'Doctor', 'Technician', 'Administrator']
  }],
  applicableDepartments: [{
    type: String,
    trim: true
  }],
  documentPath: {
    type: String,
    trim: true
  },
  approvalRequired: {
    type: Boolean,
    default: true
  },
  approvedBy: {
    type: Number // user_id
  },
  approvalDate: {
    type: Date
  },
  createdBy: {
    type: Number, // user_id
    required: true
  },
  lastReviewed: {
    type: Date
  },
  nextReviewDate: {
    type: Date
  },
  complianceNotes: {
    type: String,
    trim: true
  },
  acknowledgments: [{
    employee_id: {
      type: Number,
      required: true
    },
    acknowledgedDate: {
      type: Date,
      default: Date.now
    },
    version: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true,
  _id: false
});

// Healthcare Onboarding Workflow Schema
const HealthcareOnboardingWorkflowSchema = new mongoose.Schema({
  workflow_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  workflowName: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  steps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    stepName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    estimatedDays: {
      type: Number,
      default: 1
    },
    assignedTo: {
      type: String,
      enum: ['HR', 'Manager', 'IT', 'Compliance', 'Employee', 'System'],
      required: true
    },
    documents: [{
      type: String,
      trim: true
    }],
    prerequisites: [{
      type: String,
      trim: true
    }]
  }],
  totalEstimatedDays: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Number, // user_id
    required: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  _id: false
});

// Healthcare Onboarding Status Schema
const HealthcareOnboardingStatusSchema = new mongoose.Schema({
  status_id: {
    type: Number,
    unique: true
  },
  employee_id: {
    type: Number,
    required: true,
    ref: 'Employee'
  },
  workflow_id: {
    type: Number,
    required: true,
    ref: 'HealthcareOnboardingWorkflow'
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  currentStep: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
    default: 'Not Started'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expectedCompletionDate: {
    type: Date
  },
  actualCompletionDate: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedSteps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    completedDate: {
      type: Date,
      default: Date.now
    },
    completedBy: {
      type: Number // user_id
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  documents: [{
    documentName: {
      type: String,
      required: true
    },
    documentPath: {
      type: String,
      required: true
    },
    uploadedDate: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: Number // user_id
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  assignedTo: {
    type: Number, // user_id
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  _id: false
});

// Healthcare Roles Schema
const HealthcareRolesSchema = new mongoose.Schema({
  role_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  roleName: {
    type: String,
    required: true,
    trim: true
  },
  roleType: {
    type: String,
    enum: ['Clinical', 'Administrative', 'Support', 'Management', 'Compliance'],
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: {
    patientData: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    medicalRecords: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    scheduling: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    billing: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    reporting: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
      export: { type: Boolean, default: false }
    },
    compliance: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
      audit: { type: Boolean, default: false }
    }
  },
  hipaaAccess: {
    type: String,
    enum: ['None', 'Limited', 'Full'],
    default: 'None'
  },
  requiredCredentials: [{
    credentialType: {
      type: String,
      required: true
    },
    isRequired: {
      type: Boolean,
      default: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Number, // user_id
    required: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  _id: false
});

// Healthcare Audit Logs Schema
const HealthcareAuditLogsSchema = new mongoose.Schema({
  audit_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  user_id: {
    type: Number,
    required: true,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  resource: {
    type: String,
    required: true,
    trim: true
  },
  resourceId: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  category: {
    type: String,
    enum: [
      'Patient Data Access',
      'Medical Records',
      'User Authentication',
      'System Configuration',
      'Compliance',
      'Security',
      'Data Export',
      'Data Import',
      'Other'
    ],
    required: true
  },
  patientId: {
    type: String,
    trim: true
  },
  isCompliant: {
    type: Boolean,
    default: true
  },
  complianceNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  _id: false
});

// Pre-save hooks for auto-incrementing IDs
HealthcareRecruitmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.recruitment_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'healthcare_recruitment_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.recruitment_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

HealthcareCredentialsSchema.pre('save', async function(next) {
  if (this.isNew && !this.credential_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'healthcare_credential_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.credential_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

HealthcareShiftsSchema.pre('save', async function(next) {
  if (this.isNew && !this.shift_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'healthcare_shift_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.shift_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

HealthcareShiftAssignmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.assignment_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'healthcare_assignment_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.assignment_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

HealthcarePoliciesSchema.pre('save', async function(next) {
  if (this.isNew && !this.policy_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'healthcare_policy_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.policy_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

HealthcareOnboardingWorkflowSchema.pre('save', async function(next) {
  if (this.isNew && !this.workflow_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'healthcare_workflow_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.workflow_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

HealthcareOnboardingStatusSchema.pre('save', async function(next) {
  if (this.isNew && !this.status_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'healthcare_status_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.status_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

HealthcareRolesSchema.pre('save', async function(next) {
  if (this.isNew && !this.role_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'healthcare_role_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.role_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

HealthcareAuditLogsSchema.pre('save', async function(next) {
  if (this.isNew && !this.audit_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'healthcare_audit_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.audit_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

// Create models
const HealthcareRecruitment = mongoose.model('HealthcareRecruitment', HealthcareRecruitmentSchema);
const HealthcareCredentials = mongoose.model('HealthcareCredentials', HealthcareCredentialsSchema);
const HealthcareShifts = mongoose.model('HealthcareShifts', HealthcareShiftsSchema);
const HealthcareShiftAssignment = mongoose.model('HealthcareShiftAssignment', HealthcareShiftAssignmentSchema);
const HealthcarePolicies = mongoose.model('HealthcarePolicies', HealthcarePoliciesSchema);
const HealthcareOnboardingWorkflow = mongoose.model('HealthcareOnboardingWorkflow', HealthcareOnboardingWorkflowSchema);
const HealthcareOnboardingStatus = mongoose.model('HealthcareOnboardingStatus', HealthcareOnboardingStatusSchema);
const HealthcareRoles = mongoose.model('HealthcareRoles', HealthcareRolesSchema);
const HealthcareAuditLogs = mongoose.model('HealthcareAuditLogs', HealthcareAuditLogsSchema);

module.exports = {
  HealthcareRecruitment,
  HealthcareCredentials,
  HealthcareShifts,
  HealthcareShiftAssignment,
  HealthcarePolicies,
  HealthcareOnboardingWorkflow,
  HealthcareOnboardingStatus,
  HealthcareRoles,
  HealthcareAuditLogs
};
