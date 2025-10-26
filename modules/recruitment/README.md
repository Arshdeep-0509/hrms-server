# 🧑‍💼 Recruitment Management Module

## Overview
The Recruitment Management module provides comprehensive APIs for managing the entire hiring lifecycle, from posting job openings to onboarding new hires. It tracks candidates through various stages, schedules interviews, and manages the recruitment pipeline.

## Features
- **Job Opening Management**: Create, update, delete, and list job postings
- **Candidate Pipeline**: Track candidates through multiple stages
- **Interview Scheduling**: Schedule and manage interviews with different types
- **Status Tracking**: Complete status history for each candidate
- **Hiring Workflow**: Mark candidates as hired and trigger onboarding
- **Organization Isolation**: Multi-tenant support with organization-based access control

## Database Schemas

### Job Schema
Tracks job openings and positions:
- Organization reference (ObjectId and numeric ID)
- Organization ID (number) - Required
- Job ID (number) - Required, Unique
- Department ID (number) - Required
- Job details (title, department, description, requirements)
- Location and employment type
- Salary range
- Status (Open, On Hold, Closed, Filled)
- Hiring manager
- Application statistics

### Candidate Schema
Tracks candidates in the recruitment pipeline:
- Organization reference (ObjectId and numeric ID)
- Organization ID (number) - Required
- Candidate ID (number) - Required, Unique
- Employee ID (number) - Required
- Personal information (name, email, phone)
- Resume and cover letter
- Current status and complete status history
- Interview schedules with feedback
- Skills, experience, and education
- References
- Onboarding status
- Offer details and hire information

## API Endpoints

**Note:** Routes use numeric IDs (`job_id`, `candidate_id`) instead of MongoDB ObjectIds in the URL parameters. The system automatically resolves these numeric IDs to find the correct documents.

### Job Management

#### 1. List Job Openings
```http
GET /api/recruitment/jobs
```
**Access:** Recruiter / Client Admin

**Query Parameters:**
- `status` - Filter by status (Open, On Hold, Closed, Filled)
- `department` - Filter by department
- `search` - Search in title or description
- `organization` - Filter by organization (Super Admin only)

**Response:**
```json
[
  {
    "_id": "job_id",
    "title": "Senior Software Engineer",
    "department": "Engineering",
    "description": "We are looking for...",
    "location": "San Francisco, CA",
    "employmentType": "Full-time",
    "experienceLevel": "Senior Level",
    "salaryRange": {
      "min": 120000,
      "max": 180000,
      "currency": "USD"
    },
    "status": "Open",
    "totalApplications": 45,
    "organization": { "name": "Tech Corp" },
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

#### 2. Create Job Opening
```http
POST /api/recruitment/jobs
```
**Access:** Recruiter / Client Admin

**Request Body:**
```json
{
  "organization": "org_id",
  "organization_id": 1001,
  "job_id": 3001,
  "title": "Senior Software Engineer",
  "department": "Engineering",
  "department_id": 101,
  "description": "We are looking for an experienced software engineer...",
  "requirements": [
    "5+ years of experience",
    "Strong knowledge of Node.js"
  ],
  "location": "San Francisco, CA",
  "employmentType": "Full-time",
  "experienceLevel": "Senior Level",
  "salaryRange": {
    "min": 120000,
    "max": 180000,
    "currency": "USD"
  },
  "closingDate": "2024-03-31",
  "hiringManager": "user_id"
}
```

**Response:**
```json
{
  "message": "Job opening created successfully",
  "job": { /* job object */ }
}
```

#### 3. Update Job Details
```http
PUT /api/recruitment/jobs/:job_id
```
**Access:** Recruiter

**Parameters:**
- `job_id` - Numeric job ID

**Request Body:**
```json
{
  "status": "Closed",
  "title": "Updated Title",
  "salaryRange": {
    "min": 130000,
    "max": 190000
  }
}
```

#### 4. Delete Job Posting
```http
DELETE /api/recruitment/jobs/:job_id
```
**Access:** Recruiter

**Parameters:**
- `job_id` - Numeric job ID

**Note:** Cannot delete jobs with active candidates. Update candidate statuses first.

### Candidate Management

#### 5. List All Candidates
```http
GET /api/recruitment/candidates
```
**Access:** Recruiter / HR

**Query Parameters:**
- `job` - Filter by job ID
- `status` - Filter by current status
- `search` - Search by name or email
- `organization` - Filter by organization (Super Admin only)

**Response:**
```json
[
  {
    "_id": "candidate_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "phone": "+1-555-0123",
    "currentStatus": "Interview Scheduled",
    "job": {
      "title": "Senior Software Engineer",
      "department": "Engineering"
    },
    "applicationDate": "2024-01-20T14:30:00Z",
    "statusHistory": [
      {
        "status": "Applied",
        "changedAt": "2024-01-20T14:30:00Z",
        "notes": "Initial application submitted"
      }
    ]
  }
]
```

#### 6. Add Candidate to Pipeline
```http
POST /api/recruitment/candidates
```
**Access:** Recruiter

**Request Body:**
```json
{
  "organization": "org_id",
  "organization_id": 1001,
  "job": "job_id",
  "candidate_id": 4001,
  "employee_id": 2001,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@email.com",
  "phone": "+1-555-0123",
  "resume": {
    "url": "https://storage.com/resumes/john-doe.pdf",
    "fileName": "john-doe-resume.pdf",
    "uploadedAt": "2024-01-20T14:30:00Z"
  },
  "coverLetter": "I am excited to apply...",
  "skills": ["Node.js", "React", "MongoDB"],
  "experience": 5,
  "education": {
    "degree": "Bachelor of Science",
    "field": "Computer Science",
    "institution": "University of California",
    "graduationYear": 2019
  },
  "notes": "Strong background in full-stack development"
}
```

**Response:**
```json
{
  "message": "Candidate added successfully",
  "candidate": { /* candidate object */ }
}
```

#### 7. Update Candidate Status
```http
PUT /api/recruitment/candidates/:candidate_id
```
**Access:** Recruiter

**Parameters:**
- `candidate_id` - Numeric candidate ID

**Request Body:**
```json
{
  "currentStatus": "Interviewed",
  "statusNotes": "Candidate performed well in technical interview",
  "notes": "Strong technical skills, good cultural fit"
}
```

#### 8. Schedule Interview
```http
POST /api/recruitment/candidates/:candidate_id/interview
```
**Access:** Recruiter

**Parameters:**
- `candidate_id` - Numeric candidate ID

**Request Body:**
```json
{
  "interviewType": "Video",
  "scheduledDate": "2024-02-05",
  "scheduledTime": "10:00 AM",
  "interviewer": "user_id",
  "location": "Zoom Meeting",
  "notes": "Technical interview focusing on Node.js and system design"
}
```

**Response:**
```json
{
  "message": "Interview scheduled successfully",
  "candidate": {
    "currentStatus": "Interview Scheduled",
    "interviewSchedules": [
      {
        "interviewType": "Video",
        "scheduledDate": "2024-02-05",
        "scheduledTime": "10:00 AM",
        "status": "Scheduled"
      }
    ]
  }
}
```

#### 9. Mark Candidate as Hired
```http
POST /api/recruitment/candidates/:candidate_id/hire
```
**Access:** Recruiter / HR

**Parameters:**
- `candidate_id` - Numeric candidate ID

**Request Body:**
```json
{
  "position": "Senior Software Engineer",
  "startDate": "2024-03-01",
  "salary": 150000,
  "benefits": "Health insurance, 401k, stock options",
  "offerLetterUrl": "https://storage.com/offers/john-doe-offer.pdf"
}
```

**Response:**
```json
{
  "message": "Candidate marked as hired and onboarding triggered",
  "candidate": {
    "currentStatus": "Hired",
    "onboardingStatus": "Not Started",
    "hireDate": "2024-01-25T10:00:00Z",
    "offerDetails": {
      "position": "Senior Software Engineer",
      "startDate": "2024-03-01",
      "salary": 150000
    }
  }
}
```

## Candidate Status Flow

```
Applied → Screening → Interview Scheduled → Interviewed → Offer Extended → Hired
                                                    ↓
                                              Rejected / Withdrawn
```

## Interview Types
- `Phone` - Phone screening
- `Video` - Video conference interview
- `In-person` - Face-to-face interview
- `Panel` - Multiple interviewers

## Employment Types
- `Full-time` - Full-time position
- `Part-time` - Part-time position
- `Contract` - Contract-based work
- `Internship` - Internship program
- `Temporary` - Temporary assignment

## Experience Levels
- `Entry Level` - Entry-level position
- `Mid Level` - Mid-level position
- `Senior Level` - Senior position
- `Executive` - Executive role

## Role-Based Access Control

### Recruiter / Client Admin
- View all job openings
- Create new job postings
- View all candidates

### Recruiter Only
- Update job details
- Delete job postings
- Add candidates
- Update candidate status
- Schedule interviews

### Recruiter / HR
- View candidates
- Mark candidates as hired

## Error Handling

All endpoints return standardized error responses:

```json
{
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (no token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

## Usage Examples

### Complete Recruitment Workflow

1. **Create a Job Opening**
```bash
POST /api/recruitment/jobs
{
  "organization": "org_id",
  "organization_id": 1001,
  "job_id": 3001,
  "title": "Frontend Developer",
  "department": "Engineering",
  "department_id": 101,
  "description": "...",
  "location": "Remote",
  "employmentType": "Full-time",
  "experienceLevel": "Mid Level",
  "salaryRange": { "min": 80000, "max": 120000 }
}
```

2. **Add a Candidate**
```bash
POST /api/recruitment/candidates
{
  "organization": "org_id",
  "organization_id": 1001,
  "job": "job_id",
  "candidate_id": 4001,
  "employee_id": 2001,
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@email.com",
  "phone": "+1-555-0456",
  "skills": ["React", "TypeScript", "Node.js"]
}
```

3. **Schedule an Interview**
```bash
POST /api/recruitment/candidates/4001/interview
{
  "interviewType": "Video",
  "scheduledDate": "2024-02-10",
  "scheduledTime": "2:00 PM",
  "interviewer": "manager_id"
}
```

4. **Update Candidate Status**
```bash
PUT /api/recruitment/candidates/4001
{
  "currentStatus": "Interviewed",
  "statusNotes": "Excellent technical skills"
}
```

5. **Hire the Candidate**
```bash
POST /api/recruitment/candidates/4001/hire
{
  "position": "Frontend Developer",
  "startDate": "2024-03-15",
  "salary": 95000,
  "benefits": "Health, Dental, Vision"
}
```

## Integration Notes

- The module automatically updates job application counts when candidates are added
- When a candidate is hired, the associated job status is updated to "Filled"
- Status history is automatically maintained for audit trails
- Organization-based filtering ensures multi-tenant isolation
- Duplicate applications for the same job are prevented

## Future Enhancements

- Email notifications for interview scheduling
- Automated status change triggers
- Bulk candidate import
- Advanced analytics and reporting
- Interview feedback scoring system
- Calendar integration for interview scheduling
- Resume parsing and keyword extraction
- Automated candidate ranking

