const mongoose = require('mongoose');

// Job Opening Schema - Tracks job postings
const JobSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  organization_id: {
    type: Number,
    required: true,
  },
  job_id: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
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
  description: {
    type: String,
    required: true,
  },
  requirements: [{
    type: String,
    trim: true,
  }],
  location: {
    type: String,
    required: true,
    trim: true,
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'],
    required: true,
  },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
    required: true,
  },
  salaryRange: {
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  status: {
    type: String,
    enum: ['Open', 'On Hold', 'Closed', 'Filled'],
    default: 'Open',
  },
  postedDate: {
    type: Date,
    default: Date.now,
  },
  closingDate: {
    type: Date,
  },
  hiringManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalApplications: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Candidate Schema - Tracks candidates in the pipeline
const CandidateSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  organization_id: {
    type: Number,
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  candidate_id: {
    type: Number,
    required: true,
    unique: true,
  },
  employee_id: {
    type: Number,
    required: true,
  },
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
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  resume: {
    url: String,
    fileName: String,
    uploadedAt: Date,
  },
  coverLetter: {
    type: String,
    trim: true,
  },
  currentStatus: {
    type: String,
    enum: ['Applied', 'Screening', 'Interview Scheduled', 'Interviewed', 'Offer Extended', 'Hired', 'Rejected', 'Withdrawn'],
    default: 'Applied',
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['Applied', 'Screening', 'Interview Scheduled', 'Interviewed', 'Offer Extended', 'Hired', 'Rejected', 'Withdrawn'],
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
  interviewSchedules: [{
    interviewType: {
      type: String,
      enum: ['Phone', 'Video', 'In-person', 'Panel'],
    },
    scheduledDate: Date,
    scheduledTime: String,
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    location: String,
    notes: String,
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
    },
    feedback: {
      rating: Number,
      comments: String,
      interviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  }],
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  skills: [{
    type: String,
    trim: true,
  }],
  experience: {
    type: Number, // Years of experience
  },
  education: {
    degree: String,
    field: String,
    institution: String,
    graduationYear: Number,
  },
  references: [{
    name: String,
    relationship: String,
    email: String,
    phone: String,
  }],
  notes: {
    type: String,
    trim: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  onboardingStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  hireDate: {
    type: Date,
  },
  offerDetails: {
    position: String,
    startDate: Date,
    salary: Number,
    benefits: String,
    offerLetterUrl: String,
  },
}, { timestamps: true });

const Job = mongoose.model('Job', JobSchema);
const Candidate = mongoose.model('Candidate', CandidateSchema);

module.exports = {
  Job,
  Candidate,
};

