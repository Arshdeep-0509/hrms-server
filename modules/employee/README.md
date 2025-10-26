# Employee Management Module

## Overview
This module manages all employee lifecycle operations including employee creation, updates, status management, document handling, onboarding, and offboarding workflows.

## Base URL
`/api/employees`

## Endpoints

### 1. List All Employees
**Endpoint:** `GET /api/employees`  
**Access:** Super Admin / Client Admin  
**Description:** List all employees with optional filtering by department, employment status, role, or search query.

**Query Parameters:**
- `department` (string) - Filter by department
- `employmentStatus` (string) - Filter by employment status (Active, Inactive, On Leave, Terminated, Resigned)
- `role` (string) - Filter by role ID
- `search` (string) - Search by name, email, position, or employee ID
- `organization` (string) - Filter by organization (Super Admin only)

**Example Request:**
```bash
GET /api/employees?department=Engineering&employmentStatus=Active&search=john
```

**Example Response:**
```json
[
  {
    "_id": "...",
    "employee_id": 1001,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "position": "Senior Developer",
    "department": "Engineering",
    "employmentStatus": "Active",
    "user": { "name": "John Doe", "email": "john.doe@example.com" },
    "organization": { "name": "Acme Corp" },
    "role": { "name": "Developer" },
    "manager": { "firstName": "Jane", "lastName": "Smith" },
    "hireDate": "2024-01-15",
    "salary": { "amount": 95000, "currency": "INR" },
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

---

### 2. Get Employee by ID
**Endpoint:** `GET /api/employees/:employee_id`  
**Access:** Super Admin / Client Admin / Self (can view own profile)  
**Description:** Get detailed information about a specific employee.

**URL Parameters:**
- `employee_id` (string) - Employee ID (numeric) or MongoDB ObjectId

**Example Request:**
```bash
GET /api/employees/1001
```

**Example Response:**
```json
{
  "_id": "...",
  "employee_id": 1001,
  "user_id": 501,
  "organization_id": 1,
  "role_id": 10,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-05-15",
  "gender": "Male",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "position": "Senior Developer",
  "department": "Engineering",
  "department_id": 3,
  "employmentType": "Full-time",
  "employmentStatus": "Active",
  "hireDate": "2024-01-15",
  "salary": {
    "amount": 95000,
    "currency": "USD",
    "payFrequency": "Monthly"
  },
  "benefits": ["Health Insurance", "401k"],
  "workLocation": "New York Office",
  "documents": [],
  "onboardingStatus": "Completed",
  "offboardingStatus": "Not Started",
  "createdBy": { "name": "Admin", "email": "admin@example.com" },
  "statusHistory": [...]
}
```

---

### 3. Create New Employee
**Endpoint:** `POST /api/employees`  
**Access:** Client Admin / HR Manager  
**Description:** Add a new employee to the system.

**Request Body:**
```json
{
  "user": "user_mongodb_id",
  "user_id": 501,
  "organization_id": 1,
  "role": "role_mongodb_id",
  "role_id": 10,
  "employee_id": 1001,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-05-15",
  "gender": "Male",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+1234567891",
    "email": "jane.doe@example.com"
  },
  "position": "Senior Developer",
  "department": "Engineering",
  "department_id": 3,
  "employmentType": "Full-time",
  "hireDate": "2024-01-15",
  "salary": {
    "amount": 95000,
    "currency": "USD",
    "payFrequency": "Monthly"
  },
  "benefits": ["Health Insurance", "401k"],
  "workLocation": "New York Office",
  "manager_id": 900,
  "notes": "New hire"
}
```

**Example Response:**
```json
{
  "message": "Employee created successfully",
  "employee": {
    "_id": "...",
    "employee_id": 1001,
    "firstName": "John",
    "lastName": "Doe",
    ...
  }
}
```

---

### 4. Update Employee Details
**Endpoint:** `PUT /api/employees/:employee_id`  
**Access:** Client Admin / HR  
**Description:** Update employee information.

**URL Parameters:**
- `employee_id` (string) - Employee ID

**Request Body:** (All fields optional)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "position": "Lead Developer",
  "department": "Engineering",
  "department_id": 3,
  "salary": {
    "amount": 110000,
    "currency": "USD",
    "payFrequency": "Monthly"
  },
  "benefits": ["Health Insurance", "401k", "Gym Membership"],
  "workLocation": "Remote",
  "manager_id": 901,
  "notes": "Promoted to Lead Developer"
}
```

---

### 5. Update Employee Status
**Endpoint:** `PUT /api/employees/:employee_id/status`  
**Access:** Client Admin / HR  
**Description:** Activate, deactivate, or terminate an employee.

**URL Parameters:**
- `employee_id` (string) - Employee ID

**Request Body:**
```json
{
  "employmentStatus": "Terminated",
  "terminationDate": "2024-12-31",
  "terminationReason": "Termination",
  "terminationNotes": "Performance issues",
  "notes": "Terminated on 2024-12-31"
}
```

**Employment Status Values:**
- `Active` - Currently active
- `Inactive` - Deactivated but not terminated
- `On Leave` - On leave of absence
- `Terminated` - Termination
- `Resigned` - Voluntary resignation

**Example Response:**
```json
{
  "message": "Employee status updated successfully",
  "employee": {
    "_id": "...",
    "employmentStatus": "Terminated",
    "terminationDate": "2024-12-31",
    "statusHistory": [
      {
        "status": "Terminated",
        "changedAt": "2024-12-01T10:00:00.000Z",
        "changedBy": "...",
        "notes": "Terminated on 2024-12-31"
      }
    ]
  }
}
```

---

### 6. Upload Document
**Endpoint:** `POST /api/employees/:employee_id/documents`  
**Access:** HR / Employee  
**Description:** Upload a personnel or compliance document for an employee.

**URL Parameters:**
- `employee_id` (string) - Employee ID

**Request Body:**
```json
{
  "type": "Contract",
  "name": "Employment Contract - John Doe.pdf",
  "url": "https://storage.example.com/contracts/john-doe-contract.pdf"
}
```

**Document Types:**
- `Resume`
- `ID`
- `Contract`
- `License`
- `Certificate`
- `Other`

**Example Response:**
```json
{
  "message": "Document uploaded successfully",
  "employee": {
    "_id": "...",
    "documents": [
      {
        "_id": "...",
        "type": "Contract",
        "name": "Employment Contract - John Doe.pdf",
        "url": "https://storage.example.com/contracts/john-doe-contract.pdf",
        "uploadedAt": "2024-12-01T10:00:00.000Z",
        "uploadedBy": { "name": "HR Manager", "email": "hr@example.com" }
      }
    ]
  }
}
```

---

### 7. Trigger Onboarding Workflow
**Endpoint:** `POST /api/employees/:employee_id/onboarding`  
**Access:** HR / Client Admin  
**Description:** Start the onboarding workflow for a new employee.

**URL Parameters:**
- `employee_id` (string) - Employee ID

**Request Body:**
```json
{
  "onboardingTasks": [
    {
      "task": "Complete paperwork",
      "status": "Pending",
      "assignedTo": "user_mongodb_id",
      "notes": "Employee handbook signature required"
    },
    {
      "task": "Set up equipment",
      "status": "Pending",
      "assignedTo": "user_mongodb_id",
      "notes": "Laptop and access card"
    },
    {
      "task": "Schedule orientation",
      "status": "Pending",
      "assignedTo": "user_mongodb_id"
    }
  ]
}
```

**Example Response:**
```json
{
  "message": "Onboarding workflow started successfully",
  "employee": {
    "_id": "...",
    "onboardingStatus": "In Progress",
    "onboardingStartDate": "2024-12-01T10:00:00.000Z",
    "onboardingTasks": [...]
  }
}
```

---

### 8. Trigger Offboarding Workflow
**Endpoint:** `POST /api/employees/:employee_id/offboarding`  
**Access:** HR / Client Admin  
**Description:** Start the termination/offboarding workflow for an employee.

**URL Parameters:**
- `employee_id` (string) - Employee ID

**Request Body:**
```json
{
  "offboardingTasks": [
    {
      "task": "Collect equipment",
      "status": "Pending",
      "assignedTo": "user_mongodb_id",
      "notes": "Laptop, badge, keys"
    },
    {
      "task": "Exit interview",
      "status": "Pending",
      "assignedTo": "user_mongodb_id"
    },
    {
      "task": "Final paycheck",
      "status": "Pending",
      "assignedTo": "user_mongodb_id"
    },
    {
      "task": "Revoke system access",
      "status": "Pending",
      "assignedTo": "user_mongodb_id",
      "notes": "Disable all accounts"
    }
  ]
}
```

**Example Response:**
```json
{
  "message": "Offboarding workflow started successfully",
  "employee": {
    "_id": "...",
    "offboardingStatus": "In Progress",
    "offboardingStartDate": "2024-12-01T10:00:00.000Z",
    "offboardingTasks": [...]
  }
}
```

---

## Data Model

### Employee Schema
- **employee_id** (Number, required, unique) - Unique employee identifier
- **user** (ObjectId, ref: User, required) - Reference to user account
- **user_id** (Number, required) - User ID
- **organization** (ObjectId, ref: Organization, required) - Organization reference
- **organization_id** (Number, required) - Organization ID
- **role** (ObjectId, ref: Role) - Role reference
- **role_id** (Number, required) - Role ID
- **Personal Information:** firstName, lastName, email, phone, dateOfBirth, gender, address, emergencyContact
- **Employment Information:** position, department, department_id, employmentType, employmentStatus, hireDate, terminationDate, terminationReason, terminationNotes
- **Compensation:** salary (amount, currency, payFrequency), benefits
- **Work Details:** workLocation, manager, manager_id
- **Documents:** Array of documents with type, name, url, uploadedAt, uploadedBy
- **Onboarding:** onboardingStatus, onboardingStartDate, onboardingCompletedDate, onboardingTasks
- **Offboarding:** offboardingStatus, offboardingStartDate, offboardingCompletedDate, offboardingTasks
- **Tracking:** createdBy, updatedBy, statusHistory, notes, tags

## Notes
- All endpoints require authentication via the `protect` middleware
- Role-based authorization is enforced at each endpoint
- Employees can access their own profile
- Super Admins have access to all employees across organizations
- Client Admins and HR Managers have access to employees within their organization
- All timestamps are in UTC format
