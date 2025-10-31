const mongoose = require('mongoose');
const Counter = require('../../models/counter.model');

// Optimized unified Healthcare Schema with embedded subdocuments
const HealthcareSchema = new mongoose.Schema({
  healthcare_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Recruitment', 'Credential', 'Shift', 'Policy', 'Workflow', 'Role', 'Audit']
  },
  
  // ==================== RECRUITMENT FIELDS ====================
  recruitment: {
    position: { type: String, trim: true },
    department: { type: String, trim: true },
    specialty: { type: String, trim: true },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Per Diem', 'Locum Tenens']
    },
    shiftType: {
      type: String,
      enum: ['Day', 'Night', 'Rotating', 'On-call', 'Weekend']
    },
    requiredCredentials: [{
      credentialType: { type: String, required: true },
      isRequired: { type: Boolean, default: true }
    }],
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Expert']
    },
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
      currency: {
        type: String,
        enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
        default: 'USD'
      }
    },
    benefits: [{ type: String, trim: true }],
    description: { type: String },
    requirements: [{ type: String, trim: true }],
    responsibilities: [{ type: String, trim: true }],
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
    postedDate: { type: Date, default: Date.now },
    applicationDeadline: { type: Date },
    hiringManager: { type: Number },
    totalApplications: { type: Number, default: 0 },
    selectedCandidates: [{
      candidate_id: { type: String, required: true },
      selectedDate: { type: Date, default: Date.now },
      notes: { type: String }
    }],
    complianceNotes: { type: String, trim: true },
    hipaaTrainingRequired: { type: Boolean, default: true },
    backgroundCheckRequired: { type: Boolean, default: true },
    drugTestRequired: { type: Boolean, default: true }
  },
  
  // ==================== CREDENTIAL FIELDS ====================
  credential: {
    employee_id: { type: Number, ref: 'Employee' },
    credentialType: {
      type: String,
      enum: [
        'Medical License', 'Nursing License', 'Specialty Certification',
        'DEA License', 'Board Certification', 'CPR Certification',
        'ACLS Certification', 'PALS Certification', 'BLS Certification',
        'HIPAA Training', 'Other'
      ]
    },
    credentialName: { type: String, trim: true },
    issuingAuthority: { type: String, trim: true },
    credentialNumber: { type: String, trim: true },
    issueDate: { type: Date },
    expirationDate: { type: Date },
    renewalDate: { type: Date },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Suspended', 'Revoked', 'Pending Renewal'],
      default: 'Active'
    },
    isRequired: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    verifiedBy: { type: Number },
    documentPath: { type: String, trim: true },
    notes: { type: String, trim: true },
    autoRenewal: { type: Boolean, default: false },
    reminderDays: { type: Number, default: 30 },
    lastReminderSent: { type: Date },
    complianceStatus: {
      type: String,
      enum: ['Compliant', 'Non-Compliant', 'At Risk', 'Under Review'],
      default: 'Compliant'
    }
  },
  
  // ==================== SHIFT FIELDS ====================
  shift: {
    department_id: { type: Number, ref: 'Department' },
    shiftName: { type: String, trim: true },
    shiftType: {
      type: String,
      enum: ['Day', 'Night', 'Evening', 'On-call', 'Weekend', 'Holiday']
    },
    startTime: { type: String },
    endTime: { type: String },
    duration: { type: Number }, // in hours
    workingDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    isRotating: { type: Boolean, default: false },
    rotationPattern: { type: String, trim: true },
    breakDuration: { type: Number, default: 30 }, // in minutes
    overtimeRules: {
      dailyThreshold: { type: Number, default: 8 },
      weeklyThreshold: { type: Number, default: 40 },
      overtimeRate: { type: Number, default: 1.5 },
      doubleTimeRate: { type: Number, default: 2.0 }
    },
    requiredStaffing: {
      minimum: { type: Number },
      maximum: { type: Number },
      specialties: [{
        specialty: { type: String, required: true },
        count: { type: Number, required: true }
      }]
    },
    isActive: { type: Boolean, default: true },
    description: { type: String, trim: true },
    // Embedded: Shift Assignments
    assignments: [{
      employee_id: { type: Number, ref: 'Employee', required: true },
      assignedDate: { type: Date, required: true },
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
      status: {
        type: String,
        enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show', 'Late'],
        default: 'Scheduled'
      },
      clockInTime: { type: Date },
      clockOutTime: { type: Date },
      actualHours: { type: Number, default: 0 },
      overtimeHours: { type: Number, default: 0 },
      breakTime: { type: Number, default: 0 }, // in minutes
      notes: { type: String, trim: true },
      assignedBy: { type: Number, required: true },
      isOvertime: { type: Boolean, default: false },
      payrollCalculated: { type: Boolean, default: false },
      payrollAmount: { type: Number, default: 0 }
    }]
  },
  
  // ==================== POLICY FIELDS ====================
  policy: {
    policyName: { type: String, trim: true },
    policyType: {
      type: String,
      enum: [
        'HIPAA Compliance', 'Patient Safety', 'Clinical Protocols',
        'Emergency Procedures', 'Staff Training', 'Quality Assurance',
        'Infection Control', 'Medication Management', 'Documentation Standards', 'Other'
      ]
    },
    version: { type: String, default: '1.0' },
    effectiveDate: { type: Date },
    expirationDate: { type: Date },
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
    content: { type: String },
    summary: { type: String, trim: true },
    applicableRoles: [{
      type: String,
      enum: ['All', 'Super Admin', 'Client Admin', 'HR Account Manager', 'Employee', 'Nurse', 'Doctor', 'Technician', 'Administrator']
    }],
    applicableDepartments: [{ type: String, trim: true }],
    documentPath: { type: String, trim: true },
    approvalRequired: { type: Boolean, default: true },
    approvedBy: { type: Number },
    approvalDate: { type: Date },
    lastReviewed: { type: Date },
    nextReviewDate: { type: Date },
    complianceNotes: { type: String, trim: true },
    acknowledgments: [{
      employee_id: { type: Number, required: true },
      acknowledgedDate: { type: Date, default: Date.now },
      version: { type: String, required: true }
    }]
  },
  
  // ==================== ONBOARDING WORKFLOW FIELDS ====================
  workflow: {
    workflowName: { type: String, trim: true },
    department: { type: String, trim: true },
    position: { type: String, trim: true },
    steps: [{
      stepNumber: { type: Number, required: true },
      stepName: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      isRequired: { type: Boolean, default: true },
      estimatedDays: { type: Number, default: 1 },
      assignedTo: {
        type: String,
        enum: ['HR', 'Manager', 'IT', 'Compliance', 'Employee', 'System'],
        required: true
      },
      documents: [{ type: String, trim: true }],
      prerequisites: [{ type: String, trim: true }]
    }],
    totalEstimatedDays: { type: Number },
    isActive: { type: Boolean, default: true },
    description: { type: String, trim: true },
    // Embedded: Onboarding Status per employee
    onboardingStatuses: [{
      employee_id: { type: Number, ref: 'Employee', required: true },
      currentStep: { type: Number, default: 1 },
      status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
        default: 'Not Started'
      },
      startDate: { type: Date, default: Date.now },
      expectedCompletionDate: { type: Date },
      actualCompletionDate: { type: Date },
      progress: { type: Number, default: 0, min: 0, max: 100 },
      completedSteps: [{
        stepNumber: { type: Number, required: true },
        completedDate: { type: Date, default: Date.now },
        completedBy: { type: Number },
        notes: { type: String, trim: true }
      }],
      documents: [{
        documentName: { type: String, required: true },
        documentPath: { type: String, required: true },
        uploadedDate: { type: Date, default: Date.now },
        uploadedBy: { type: Number },
        isVerified: { type: Boolean, default: false }
      }],
      assignedTo: { type: Number, required: true },
      notes: { type: String, trim: true }
    }]
  },
  
  // ==================== ROLE FIELDS ====================
  role: {
    roleName: { type: String, trim: true },
    roleType: {
      type: String,
      enum: ['Clinical', 'Administrative', 'Support', 'Management', 'Compliance']
    },
    department: { type: String, trim: true },
    description: { type: String, trim: true },
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
      credentialType: { type: String, required: true },
      isRequired: { type: Boolean, default: true }
    }],
    isActive: { type: Boolean, default: true },
    lastModified: { type: Date, default: Date.now }
  },
  
  // ==================== AUDIT LOG FIELDS ====================
  audit: {
    user_id: { type: Number, ref: 'User', required: true },
    action: { type: String, required: true, trim: true },
    resource: { type: String, required: true, trim: true },
    resourceId: { type: String, required: true, trim: true },
    details: { type: String, trim: true },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low'
    },
    category: {
      type: String,
      enum: [
        'Patient Data Access', 'Medical Records', 'User Authentication',
        'System Configuration', 'Compliance', 'Security',
        'Data Export', 'Data Import', 'Other'
      ],
      required: true
    },
    patientId: { type: String, trim: true },
    isCompliant: { type: Boolean, default: true },
    complianceNotes: { type: String, trim: true }
  },
  
  // ==================== METADATA ====================
  createdBy: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  _id: false
});

// Pre-save hook for auto-incrementing healthcare_id
HealthcareSchema.pre('save', async function(next) {
  if (this.isNew && !this.healthcare_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'healthcare_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.healthcare_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

// Create model
const Healthcare = mongoose.model('Healthcare', HealthcareSchema);

module.exports = { Healthcare };
