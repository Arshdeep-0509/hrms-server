const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const recruitmentController = require('./recruitment.controller');

const router = express.Router();

// Define Role-Based Authorizations
const recruiterOnly = authorize(['Recruitment Specialist']);
const recruiterOrClientAdmin = authorize(['Recruitment Specialist', 'Client Admin']);
const recruiterOrHR = authorize(['Recruitment Specialist', 'HR Account Manager']);

// Recruitment Management Routes

/**
 * @swagger
 * /api/recruitment/jobs:
 *   get:
 *     summary: List all job openings
 *     tags: [Recruitment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, Closed, On Hold, Draft]
 *         description: Filter by job status
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: employmentType
 *         schema:
 *           type: string
 *           enum: [Full-time, Part-time, Contract, Intern, Temporary]
 *         description: Filter by employment type
 *       - in: query
 *         name: organization_id
 *         schema:
 *           type: integer
 *         description: Filter by organization ID
 *     responses:
 *       200:
 *         description: Job openings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobOpening'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/recruitment/jobs/{job_id}:
 *   get:
 *     summary: Get job opening by ID
 *     tags: [Recruitment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: job_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job opening retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobOpening'
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/jobs/:job_id', protect, recruiterOrClientAdmin, recruitmentController.getJob.bind(recruitmentController));

router.get('/jobs', protect, recruiterOrClientAdmin, recruitmentController.listJobs.bind(recruitmentController));

/**
 * @swagger
 * /api/recruitment/jobs:
 *   post:
 *     summary: Create new job opening
 *     tags: [Recruitment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organization_id
 *               - title
 *               - department
 *               - location
 *               - employmentType
 *               - description
 *               - requirements
 *             properties:
 *               organization_id:
 *                 type: integer
 *                 description: Organization ID
 *               title:
 *                 type: string
 *                 description: Job title
 *               department:
 *                 type: string
 *                 description: Department
 *               location:
 *                 type: string
 *                 description: Job location
 *               employmentType:
 *                 type: string
 *                 enum: [Full-time, Part-time, Contract, Intern, Temporary]
 *                 description: Employment type
 *               description:
 *                 type: string
 *                 description: Job description
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Job requirements
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Job responsibilities
 *               salary:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                   max:
 *                     type: number
 *                   currency:
 *                     type: string
 *                     enum: [USD, INR, EUR, GBP, CAD, AUD, JPY]
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Job benefits
 *               status:
 *                 type: string
 *                 enum: [Open, Closed, On Hold, Draft]
 *                 default: Draft
 *                 description: Job status
 *     responses:
 *       201:
 *         description: Job opening created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 job:
 *                   $ref: '#/components/schemas/JobOpening'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/jobs', protect, recruiterOrClientAdmin, recruitmentController.createJob.bind(recruitmentController));

/**
 * @swagger
 * /api/recruitment/jobs/{job_id}:
 *   put:
 *     summary: Update job details
 *     tags: [Recruitment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: job_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               department:
 *                 type: string
 *               location:
 *                 type: string
 *               employmentType:
 *                 type: string
 *                 enum: [Full-time, Part-time, Contract, Intern, Temporary]
 *               description:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *               salary:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                   max:
 *                     type: number
 *                   currency:
 *                     type: string
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [Open, Closed, On Hold, Draft]
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 job:
 *                   $ref: '#/components/schemas/JobOpening'
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/jobs/:job_id', protect, recruiterOnly, recruitmentController.updateJob.bind(recruitmentController));

/**
 * @swagger
 * /api/recruitment/jobs/{job_id}:
 *   delete:
 *     summary: Delete job posting
 *     tags: [Recruitment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: job_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/jobs/:job_id', protect, recruiterOnly, recruitmentController.deleteJob.bind(recruitmentController));

/**
 * @swagger
 * /api/recruitment/candidates:
 *   get:
 *     summary: List all candidates
 *     tags: [Recruitment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Applied, Screening, Interview, Offered, Hired, Rejected, Withdrawn]
 *         description: Filter by candidate status
 *       - in: query
 *         name: job_id
 *         schema:
 *           type: string
 *         description: Filter by job ID
 *       - in: query
 *         name: organization_id
 *         schema:
 *           type: integer
 *         description: Filter by organization ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Candidates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidate'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/recruitment/candidates/{candidate_id}:
 *   get:
 *     summary: Get candidate by ID
 *     tags: [Recruitment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidate_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Candidate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/candidates/:candidate_id', protect, recruiterOrHR, recruitmentController.getCandidate.bind(recruitmentController));

router.get('/candidates', protect, recruiterOrHR, recruitmentController.listCandidates.bind(recruitmentController));

/**
 * @swagger
 * /api/recruitment/candidates:
 *   post:
 *     summary: Add candidate to pipeline
 *     tags: [Recruitment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - job_id
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *             properties:
 *               job_id:
 *                 type: string
 *                 description: Job ID
 *               firstName:
 *                 type: string
 *                 description: First name
 *               lastName:
 *                 type: string
 *                 description: Last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               resume:
 *                 type: string
 *                 description: Resume file path or URL
 *               coverLetter:
 *                 type: string
 *                 description: Cover letter
 *               experience:
 *                 type: number
 *                 description: Years of experience
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Candidate skills
 *               education:
 *                 type: string
 *                 description: Education background
 *               status:
 *                 type: string
 *                 enum: [Applied, Screening, Interview, Offered, Hired, Rejected, Withdrawn]
 *                 default: Applied
 *                 description: Candidate status
 *               notes:
 *                 type: string
 *                 description: Internal notes
 *     responses:
 *       201:
 *         description: Candidate added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 candidate:
 *                   $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/candidates', protect, recruiterOnly, recruitmentController.addCandidate.bind(recruitmentController));

/**
 * @swagger
 * /api/recruitment/candidates/{candidate_id}:
 *   put:
 *     summary: Update candidate status
 *     tags: [Recruitment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidate_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Applied, Screening, Interview, Offered, Hired, Rejected, Withdrawn]
 *               notes:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Candidate rating
 *               feedback:
 *                 type: string
 *                 description: Interview feedback
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 candidate:
 *                   $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Candidate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/candidates/:candidate_id', protect, recruiterOnly, recruitmentController.updateCandidate.bind(recruitmentController));

/**
 * @swagger
 * /api/recruitment/candidates/{candidate_id}/interview:
 *   post:
 *     summary: Schedule interview
 *     tags: [Recruitment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidate_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - interviewDate
 *               - interviewType
 *               - interviewer
 *             properties:
 *               interviewDate:
 *                 type: string
 *                 format: date-time
 *                 description: Interview date and time
 *               interviewType:
 *                 type: string
 *                 enum: [Phone, Video, In-person, Technical, HR, Final]
 *                 description: Interview type
 *               interviewer:
 *                 type: string
 *                 description: Interviewer name
 *               location:
 *                 type: string
 *                 description: Interview location (for in-person)
 *               meetingLink:
 *                 type: string
 *                 description: Meeting link (for video interviews)
 *               notes:
 *                 type: string
 *                 description: Interview notes
 *     responses:
 *       201:
 *         description: Interview scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 interview:
 *                   type: object
 *                   properties:
 *                     interview_id:
 *                       type: string
 *                     candidate_id:
 *                       type: string
 *                     interviewDate:
 *                       type: string
 *                       format: date-time
 *                     interviewType:
 *                       type: string
 *                     interviewer:
 *                       type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/candidates/:candidate_id/interview', protect, recruiterOnly, recruitmentController.scheduleInterview.bind(recruitmentController));

/**
 * @swagger
 * /api/recruitment/candidates/{candidate_id}/hire:
 *   post:
 *     summary: Mark candidate as hired and trigger onboarding
 *     tags: [Recruitment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidate_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - salary
 *               - position
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Employment start date
 *               salary:
 *                 type: object
 *                 required:
 *                   - amount
 *                   - currency
 *                 properties:
 *                   amount:
 *                     type: number
 *                   currency:
 *                     type: string
 *                     enum: [USD, INR, EUR, GBP, CAD, AUD, JPY]
 *                   payFrequency:
 *                     type: string
 *                     enum: [Weekly, Bi-weekly, Monthly, Annually]
 *               position:
 *                 type: string
 *                 description: Job position
 *               department:
 *                 type: string
 *                 description: Department
 *               manager_id:
 *                 type: integer
 *                 description: Manager employee ID
 *               offerLetter:
 *                 type: string
 *                 description: Offer letter content
 *     responses:
 *       201:
 *         description: Candidate hired and onboarding triggered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 employee:
 *                   $ref: '#/components/schemas/Employee'
 *                 onboarding:
 *                   type: object
 *                   properties:
 *                     onboarding_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [Pending, In Progress, Completed]
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/candidates/:candidate_id/hire', protect, recruiterOrHR, recruitmentController.hireCandidate.bind(recruitmentController));

module.exports = router;

