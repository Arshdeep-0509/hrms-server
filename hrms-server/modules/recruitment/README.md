# Recruitment Module

## Overview
The Recruitment module manages job postings, candidate applications, interview scheduling, and the hiring process.

## Purpose
Streamline the recruitment process from job posting to candidate selection and onboarding.

## File Structure
```
recruitment/
├── recruitment.schema.js     # Database models
├── recruitment.service.js    # Business logic
├── recruitment.controller.js # Request handlers
├── recruitment.routes.js     # API endpoints
└── README.md                 # This file
```

## Schemas

### Job (Job Opening)
- job_id, organization_id, department_id
- title, description, requirements
- location, employmentType
- experienceLevel, salaryRange
- status (Open, On Hold, Closed, Filled)
- posting dates

### Candidate
- candidate_id, employee_id, organization_id
- firstName, lastName, email, phone
- resume, coverLetter
- currentStatus (tracked in pipeline)
- skills, experience, education
- interviewSchedules
- offerDetails
- onboardingStatus

## Key Features
- Job posting management
- Candidate pipeline tracking
- Interview scheduling
- Status history
- Application management
- Skills and qualifications tracking

## API Endpoints
- `POST /api/recruitment/jobs` - Post job
- `GET /api/recruitment/jobs` - List jobs
- `POST /api/recruitment/candidates` - Add candidate
- `GET /api/recruitment/candidates` - List candidates
- `PUT /api/recruitment/candidates/:id` - Update status
- `POST /api/recruitment/interviews` - Schedule interview

## Related Modules
- **Employee** - Convert candidate to employee
- **Department** - Job openings by department
- **Organization** - Organization-level recruitment
