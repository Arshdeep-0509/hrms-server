const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  ticket_id: {
    type: Number,
    required: true,
    unique: true,
  },
  
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['HR', 'IT', 'Payroll', 'Finance', 'General', 'Technical', 'Account', 'Other'],
  },
  subcategory: {
    type: String,
    trim: true,
  },
  
  // Status and Priority
  status: {
    type: String,
    enum: ['Open', 'Pending', 'In Progress', 'Resolved', 'Closed', 'Escalated'],
    default: 'Open',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  
  // SLA Management
  sla: {
    type: String,
    enum: ['Standard', 'High Priority', 'Critical'],
    default: 'Standard',
  },
  slaDeadline: {
    type: Date,
  },
  responseTime: {
    type: Number, // in hours
    default: 24,
  },
  resolutionTime: {
    type: Number, // in hours
    default: 72,
  },
  
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedTo_id: {
    type: Number,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedBy_id: {
    type: Number,
  },
  assignedAt: {
    type: Date,
  },
  
  // Requester Information
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requester_id: {
    type: Number,
    required: true,
  },
  requesterEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  requesterName: {
    type: String,
    required: true,
    trim: true,
  },
  requesterDepartment: {
    type: String,
    trim: true,
  },
  
  // Organization
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  organization_id: {
    type: Number,
    required: true,
  },
  
  // Resolution
  resolution: {
    type: String,
    trim: true,
  },
  resolutionNotes: {
    type: String,
    trim: true,
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolvedBy_id: {
    type: Number,
  },
  
  // Escalation
  escalatedAt: {
    type: Date,
  },
  escalatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  escalatedBy_id: {
    type: Number,
  },
  escalationReason: {
    type: String,
    trim: true,
  },
  escalationLevel: {
    type: Number,
    default: 0,
  },
  
  // Comments and Communication
  comments: [{
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    commentedBy_id: {
      type: Number,
      required: true,
    },
    commentedByName: {
      type: String,
      required: true,
    },
    commentedAt: {
      type: Date,
      default: Date.now,
    },
    editedAt: {
      type: Date,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  }],
  
  // Attachments
  attachments: [{
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedBy_id: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  }],
  
  // Tags and Labels
  tags: [{
    type: String,
    trim: true,
  }],
  labels: [{
    type: String,
    trim: true,
  }],
  
  // Time Tracking
  timeSpent: {
    type: Number, // in minutes
    default: 0,
  },
  estimatedTime: {
    type: Number, // in minutes
  },
  
  // Status History
  statusHistory: [{
    status: {
      type: String,
      enum: ['Open', 'Pending', 'In Progress', 'Resolved', 'Closed', 'Escalated'],
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    changedBy_id: {
      type: Number,
    },
    reason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  }],
  
  // Priority History
  priorityHistory: [{
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    changedBy_id: {
      type: Number,
    },
    reason: {
      type: String,
      trim: true,
    },
  }],
  
  // Assignment History
  assignmentHistory: [{
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedTo_id: {
      type: Number,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedBy_id: {
      type: Number,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      trim: true,
    },
  }],
  
  // Customer Satisfaction
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      trim: true,
    },
    ratedAt: {
      type: Date,
    },
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  
  // Additional Information
  source: {
    type: String,
    enum: ['Web Portal', 'Email', 'Phone', 'Walk-in', 'API', 'Other'],
    default: 'Web Portal',
  },
  impact: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  
  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  deletedBy_id: {
    type: Number,
  },
  deleteReason: {
    type: String,
    trim: true,
  },
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdBy_id: {
    type: Number,
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy_id: {
    type: Number,
  },
}, { timestamps: true });

// Indexes for better query performance
TicketSchema.index({ ticket_id: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ priority: 1 });
TicketSchema.index({ category: 1 });
TicketSchema.index({ requester: 1 });
TicketSchema.index({ assignedTo: 1 });
TicketSchema.index({ organization: 1 });
TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ slaDeadline: 1 });
TicketSchema.index({ isDeleted: 1 });

// Pre-save middleware to set SLA deadline
TicketSchema.pre('save', function(next) {
  if (this.isNew && !this.slaDeadline) {
    const now = new Date();
    const hours = this.resolutionTime || 72;
    this.slaDeadline = new Date(now.getTime() + (hours * 60 * 60 * 1000));
  }
  next();
});

// Virtual for ticket number (formatted)
TicketSchema.virtual('ticketNumber').get(function() {
  return `TKT-${this.ticket_id.toString().padStart(6, '0')}`;
});

// Virtual for time since creation
TicketSchema.virtual('ageInHours').get(function() {
  const now = new Date();
  const created = this.createdAt;
  return Math.floor((now - created) / (1000 * 60 * 60));
});

// Virtual for SLA status
TicketSchema.virtual('slaStatus').get(function() {
  if (!this.slaDeadline) return 'No SLA';
  
  const now = new Date();
  const deadline = this.slaDeadline;
  
  if (this.status === 'Resolved' || this.status === 'Closed') {
    return 'Completed';
  }
  
  if (now > deadline) {
    return 'Overdue';
  }
  
  const hoursLeft = Math.floor((deadline - now) / (1000 * 60 * 60));
  if (hoursLeft <= 2) {
    return 'Critical';
  } else if (hoursLeft <= 24) {
    return 'Warning';
  }
  
  return 'On Track';
});

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;
