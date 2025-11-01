const recruitmentService = require('./recruitment.service');

class RecruitmentController {
  /**
   * List job openings
   * Accessible by: Recruiter / Client Admin
   */
  async listJobs(req, res) {
    try {
      const jobs = await recruitmentService.listJobs(req.query, req.user);
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during job retrieval' });
    }
  }

  /**
   * Get job opening by ID
   * Accessible by: Recruiter / Client Admin
   */
  async getJob(req, res) {
    try {
      const job = await recruitmentService.getJob(req.params.job_id, req.user);
      res.json(job);
    } catch (error) {
      console.error('Error fetching job:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during job retrieval' });
    }
  }

  /**
   * Create new job opening
   * Accessible by: Recruiter / Client Admin
   */
  async createJob(req, res) {
    try {
      const result = await recruitmentService.createJob(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating job:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during job creation' });
    }
  }

  /**
   * Update job details
   * Accessible by: Recruiter
   */
  async updateJob(req, res) {
    try {
      const result = await recruitmentService.updateJob(req.params.job_id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error updating job:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during job update' });
    }
  }

  /**
   * Delete job posting
   * Accessible by: Recruiter
   */
  async deleteJob(req, res) {
    try {
      const result = await recruitmentService.deleteJob(req.params.job_id, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error deleting job:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during job deletion' });
    }
  }

  /**
   * Get candidate by ID
   * Accessible by: Recruiter / HR
   */
  async getCandidate(req, res) {
    try {
      const candidate = await recruitmentService.getCandidate(req.params.candidate_id, req.user);
      res.json(candidate);
    } catch (error) {
      console.error('Error fetching candidate:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during candidate retrieval' });
    }
  }

  /**
   * List all candidates
   * Accessible by: Recruiter / HR
   */
  async listCandidates(req, res) {
    try {
      const candidates = await recruitmentService.listCandidates(req.query, req.user);
      res.json(candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during candidate retrieval' });
    }
  }

  /**
   * Add candidate to pipeline
   * Accessible by: Recruiter
   */
  async addCandidate(req, res) {
    try {
      const result = await recruitmentService.addCandidate(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error adding candidate:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during candidate creation' });
    }
  }

  /**
   * Update candidate status
   * Accessible by: Recruiter
   */
  async updateCandidate(req, res) {
    try {
      const result = await recruitmentService.updateCandidate(req.params.candidate_id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error updating candidate:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during candidate update' });
    }
  }

  /**
   * Schedule interview
   * Accessible by: Recruiter
   */
  async scheduleInterview(req, res) {
    try {
      const result = await recruitmentService.scheduleInterview(req.params.candidate_id, req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during interview scheduling' });
    }
  }

  /**
   * Mark candidate as hired and trigger onboarding
   * Accessible by: Recruiter / HR
   */
  async hireCandidate(req, res) {
    try {
      const result = await recruitmentService.hireCandidate(req.params.candidate_id, req.body, req.user);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error hiring candidate:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during candidate hiring' });
    }
  }
}

module.exports = new RecruitmentController();

