const { Job, Candidate } = require('./recruitment.schema');
const Organization = require('../organization/organization.schema');

class RecruitmentService {
  /**
   * List job openings with filters
   * @param {Object} filters - Filter options (status, department, organization)
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} Array of job openings
   */
  async listJobs(filters, user) {
    const query = {};

    // If user is not Super Admin, filter by their organization
    if (user.role !== 'Super Admin') {
      const organization = await Organization.findOne({ clientAdmin: user.id });
      if (organization) {
        query.organization = organization._id;
      } else {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
    } else if (filters.organization) {
      query.organization = filters.organization;
    }

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.department) {
      query.department = filters.department;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(query)
      .populate('organization', 'name')
      .populate('hiringManager', 'name email')
      .populate('createdBy', 'name email')
      .sort({ postedDate: -1, createdAt: -1 });

    return jobs;
  }

  /**
   * Create new job opening
   * @param {Object} jobData - Job data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Created job
   */
  async createJob(jobData, user) {
    const {
      organization,
      organization_id,
      job_id,
      title,
      department,
      department_id,
      description,
      requirements,
      location,
      employmentType,
      experienceLevel,
      salaryRange,
      closingDate,
      hiringManager,
    } = jobData;

    // Validate organization access
    let organizationId = organization;
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org) {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
      organizationId = org._id;
    } else {
      const org = await Organization.findById(organization);
      if (!org) {
        throw { statusCode: 404, message: 'Organization not found.' };
      }
    }

    const job = await Job.create({
      organization: organizationId,
      organization_id,
      job_id,
      title,
      department,
      department_id,
      description,
      requirements: requirements || [],
      location,
      employmentType,
      experienceLevel,
      salaryRange,
      closingDate,
      hiringManager,
      createdBy: user.id,
    });

    await job.populate('organization', 'name');
    await job.populate('hiringManager', 'name email');
    await job.populate('createdBy', 'name email');

    return {
      message: 'Job opening created successfully',
      job,
    };
  }

  /**
   * Update job details
   * @param {String} jobId - Job ID
   * @param {Object} updateData - Update data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated job
   */
  async updateJob(jobId, updateData, user) {
    // Try to find by job_id first (numeric), then fall back to ObjectId
    let job = await Job.findOne({ job_id: parseInt(jobId) });
    if (!job) {
      job = await Job.findById(jobId);
    }

    if (!job) {
      throw { statusCode: 404, message: 'Job opening not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || job.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this job opening.' };
      }
    }

    // Update allowed fields
    const allowedFields = [
      'title',
      'department',
      'department_id',
      'description',
      'requirements',
      'location',
      'employmentType',
      'experienceLevel',
      'salaryRange',
      'status',
      'closingDate',
      'hiringManager',
    ];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        job[field] = updateData[field];
      }
    });

    await job.save();
    await job.populate('organization', 'name');
    await job.populate('hiringManager', 'name email');
    await job.populate('createdBy', 'name email');

    return {
      message: 'Job opening updated successfully',
      job,
    };
  }

  /**
   * Delete job posting
   * @param {String} jobId - Job ID
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Success message
   */
  async deleteJob(jobId, user) {
    // Try to find by job_id first (numeric), then fall back to ObjectId
    let job = await Job.findOne({ job_id: parseInt(jobId) });
    if (!job) {
      job = await Job.findById(jobId);
    }

    if (!job) {
      throw { statusCode: 404, message: 'Job opening not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || job.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this job opening.' };
      }
    }

    // Check if there are active candidates
    const activeCandidates = await Candidate.countDocuments({
      job: jobId,
      currentStatus: { $nin: ['Rejected', 'Withdrawn', 'Hired'] },
    });

    if (activeCandidates > 0) {
      throw {
        statusCode: 400,
        message: `Cannot delete job opening with ${activeCandidates} active candidate(s). Please update candidate statuses first.`,
      };
    }

    // Delete by job_id if numeric, otherwise by ObjectId
    await Job.deleteOne(job.job_id ? { job_id: job.job_id } : { _id: job._id });

    return { message: 'Job opening deleted successfully' };
  }

  /**
   * List all candidates
   * @param {Object} filters - Filter options (status, job, organization)
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} Array of candidates
   */
  async listCandidates(filters, user) {
    const query = {};

    // If user is not Super Admin, filter by their organization
    if (user.role !== 'Super Admin') {
      const organization = await Organization.findOne({ clientAdmin: user.id });
      if (organization) {
        query.organization = organization._id;
      } else {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
    } else if (filters.organization) {
      query.organization = filters.organization;
    }

    // Apply filters
    if (filters.job) {
      query.job = filters.job;
    }

    if (filters.status) {
      query.currentStatus = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const candidates = await Candidate.find(query)
      .populate('organization', 'name')
      .populate('job', 'title department')
      .populate('addedBy', 'name email')
      .populate('interviewSchedules.interviewer', 'name email')
      .sort({ applicationDate: -1, createdAt: -1 });

    return candidates;
  }

  /**
   * Add candidate to pipeline
   * @param {Object} candidateData - Candidate data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Created candidate
   */
  async addCandidate(candidateData, user) {
    const {
      organization,
      organization_id,
      job,
      candidate_id,
      employee_id,
      firstName,
      lastName,
      email,
      phone,
      resume,
      coverLetter,
      skills,
      experience,
      education,
      notes,
    } = candidateData;

    // Validate organization access
    let organizationId = organization;
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org) {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
      organizationId = org._id;
    } else {
      const org = await Organization.findById(organization);
      if (!org) {
        throw { statusCode: 404, message: 'Organization not found.' };
      }
    }

    // Validate job exists
    const jobDoc = await Job.findById(job);
    if (!jobDoc) {
      throw { statusCode: 404, message: 'Job opening not found.' };
    }

    // Check if candidate already applied for this job
    const existingCandidate = await Candidate.findOne({
      job,
      email: email.toLowerCase(),
    });

    if (existingCandidate) {
      throw { statusCode: 400, message: 'Candidate has already applied for this job opening.' };
    }

    const candidate = await Candidate.create({
      organization: organizationId,
      organization_id,
      job,
      candidate_id,
      employee_id,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      resume,
      coverLetter,
      skills: skills || [],
      experience,
      education,
      notes,
      addedBy: user.id,
      statusHistory: [{
        status: 'Applied',
        changedAt: new Date(),
        changedBy: user.id,
        notes: 'Initial application submitted',
      }],
    });

    // Update job application count
    await Job.findByIdAndUpdate(job, { $inc: { totalApplications: 1 } });

    await candidate.populate('organization', 'name');
    await candidate.populate('job', 'title department');
    await candidate.populate('addedBy', 'name email');

    return {
      message: 'Candidate added successfully',
      candidate,
    };
  }

  /**
   * Update candidate status
   * @param {String} candidateId - Candidate ID
   * @param {Object} updateData - Update data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated candidate
   */
  async updateCandidate(candidateId, updateData, user) {
    // Try to find by candidate_id first (numeric), then fall back to ObjectId
    let candidate = await Candidate.findOne({ candidate_id: parseInt(candidateId) });
    if (!candidate) {
      candidate = await Candidate.findById(candidateId);
    }

    if (!candidate) {
      throw { statusCode: 404, message: 'Candidate not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || candidate.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this candidate.' };
      }
    }

    // If status is being updated, add to history
    if (updateData.currentStatus && updateData.currentStatus !== candidate.currentStatus) {
      candidate.statusHistory.push({
        status: updateData.currentStatus,
        changedAt: new Date(),
        changedBy: user.id,
        notes: updateData.statusNotes || '',
      });
    }

    // Update allowed fields
    const allowedFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'resume',
      'coverLetter',
      'currentStatus',
      'skills',
      'experience',
      'education',
      'notes',
      'employee_id',
    ];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        candidate[field] = updateData[field];
      }
    });

    await candidate.save();
    await candidate.populate('organization', 'name');
    await candidate.populate('job', 'title department');
    await candidate.populate('addedBy', 'name email');

    return {
      message: 'Candidate updated successfully',
      candidate,
    };
  }

  /**
   * Schedule interview for candidate
   * @param {String} candidateId - Candidate ID
   * @param {Object} interviewData - Interview data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated candidate with interview scheduled
   */
  async scheduleInterview(candidateId, interviewData, user) {
    // Try to find by candidate_id first (numeric), then fall back to ObjectId
    let candidate = await Candidate.findOne({ candidate_id: parseInt(candidateId) });
    if (!candidate) {
      candidate = await Candidate.findById(candidateId);
    }

    if (!candidate) {
      throw { statusCode: 404, message: 'Candidate not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || candidate.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this candidate.' };
      }
    }

    const {
      interviewType,
      scheduledDate,
      scheduledTime,
      interviewer,
      location,
      notes,
    } = interviewData;

    // Add interview to schedule
    candidate.interviewSchedules.push({
      interviewType,
      scheduledDate,
      scheduledTime,
      interviewer,
      location,
      notes,
      status: 'Scheduled',
    });

    // Update candidate status if needed
    if (candidate.currentStatus === 'Applied' || candidate.currentStatus === 'Screening') {
      candidate.currentStatus = 'Interview Scheduled';
      candidate.statusHistory.push({
        status: 'Interview Scheduled',
        changedAt: new Date(),
        changedBy: user.id,
        notes: 'Interview scheduled',
      });
    }

    await candidate.save();
    await candidate.populate('organization', 'name');
    await candidate.populate('job', 'title department');
    await candidate.populate('interviewSchedules.interviewer', 'name email');

    return {
      message: 'Interview scheduled successfully',
      candidate,
    };
  }

  /**
   * Mark candidate as hired and trigger onboarding
   * @param {String} candidateId - Candidate ID
   * @param {Object} hireData - Hire data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated candidate with hire status
   */
  async hireCandidate(candidateId, hireData, user) {
    // Try to find by candidate_id first (numeric), then fall back to ObjectId
    let candidate = await Candidate.findOne({ candidate_id: parseInt(candidateId) });
    if (!candidate) {
      candidate = await Candidate.findById(candidateId);
    }

    if (!candidate) {
      throw { statusCode: 404, message: 'Candidate not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || candidate.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this candidate.' };
      }
    }

    const {
      position,
      startDate,
      salary,
      benefits,
      offerLetterUrl,
    } = hireData;

    // Update candidate status to Hired
    candidate.currentStatus = 'Hired';
    candidate.onboardingStatus = 'Not Started';
    candidate.hireDate = new Date();
    candidate.offerDetails = {
      position,
      startDate,
      salary,
      benefits,
      offerLetterUrl,
    };

    // Add to status history
    candidate.statusHistory.push({
      status: 'Hired',
      changedAt: new Date(),
      changedBy: user.id,
      notes: 'Candidate hired and onboarding triggered',
    });

    // Update job status to Filled if not already
    const job = await Job.findById(candidate.job);
    if (job && job.status !== 'Filled') {
      job.status = 'Filled';
      await job.save();
    }

    await candidate.save();
    await candidate.populate('organization', 'name');
    await candidate.populate('job', 'title department');
    await candidate.populate('addedBy', 'name email');

    return {
      message: 'Candidate marked as hired and onboarding triggered',
      candidate,
    };
  }
}

module.exports = new RecruitmentService();

