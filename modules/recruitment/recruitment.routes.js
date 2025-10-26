const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const recruitmentController = require('./recruitment.controller');

const router = express.Router();

// Define Role-Based Authorizations
const recruiterOnly = authorize(['Recruitment Specialist']);
const recruiterOrClientAdmin = authorize(['Recruitment Specialist', 'Client Admin']);
const recruiterOrHR = authorize(['Recruitment Specialist', 'HR Account Manager']);

// Job Management Routes

// 1. List job openings
// GET /api/recruitment/jobs
router.get('/jobs', protect, recruiterOrClientAdmin, recruitmentController.listJobs.bind(recruitmentController));

// 2. Create new job opening
// POST /api/recruitment/jobs
router.post('/jobs', protect, recruiterOrClientAdmin, recruitmentController.createJob.bind(recruitmentController));

// 3. Update job details
// PUT /api/recruitment/jobs/:job_id
router.put('/jobs/:job_id', protect, recruiterOnly, recruitmentController.updateJob.bind(recruitmentController));

// 4. Delete job posting
// DELETE /api/recruitment/jobs/:job_id
router.delete('/jobs/:job_id', protect, recruiterOnly, recruitmentController.deleteJob.bind(recruitmentController));

// Candidate Management Routes

// 5. List all candidates
// GET /api/recruitment/candidates
router.get('/candidates', protect, recruiterOrHR, recruitmentController.listCandidates.bind(recruitmentController));

// 6. Add candidate to pipeline
// POST /api/recruitment/candidates
router.post('/candidates', protect, recruiterOnly, recruitmentController.addCandidate.bind(recruitmentController));

// 7. Update candidate status
// PUT /api/recruitment/candidates/:candidate_id
router.put('/candidates/:candidate_id', protect, recruiterOnly, recruitmentController.updateCandidate.bind(recruitmentController));

// 8. Schedule interview
// POST /api/recruitment/candidates/:candidate_id/interview
router.post('/candidates/:candidate_id/interview', protect, recruiterOnly, recruitmentController.scheduleInterview.bind(recruitmentController));

// 9. Mark candidate as hired and trigger onboarding
// POST /api/recruitment/candidates/:candidate_id/hire
router.post('/candidates/:candidate_id/hire', protect, recruiterOrHR, recruitmentController.hireCandidate.bind(recruitmentController));

module.exports = router;

