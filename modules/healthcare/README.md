# Healthcare HR Module

## Overview
The Healthcare module provides specialized HR functionality for medical/clinical organizations with HIPAA compliance, credential tracking, and clinical staff management.

## Purpose
Manage healthcare-specific requirements including medical licenses, HIPAA compliance, clinical workflows, and credential tracking.

## File Structure
```
healthcare/
├── healthcare.schema.js     # Database models (9 schemas)
├── healthcare.service.js    # Business logic
├── healthcare.controller.js # Request handlers
├── healthcare.routes.js     # API endpoints (23 endpoints)
└── README.md                # This file
```

## Schemas

### HealthcareRecruitment
- Medical position recruitment
- Required credentials tracking
- Specialty and shift types
- HIPAA training requirements

### HealthcareCredentials
- Credential types (Medical License, DEA, Board Certification, etc.)
- Issue and expiration dates
- Renewal tracking
- Auto-notification for expiring licenses

### HealthcareShifts & HealthcareShiftAssignment
- Shift scheduling for clinical staff
- Shift types (Day, Night, On-call, etc.)
- Required staffing levels
- Overtime calculations

### HealthcarePolicies
- HIPAA compliance policies
- Clinical protocols
- Patient safety policies
- Policy acknowledgments

### HealthcareOnboardingWorkflow & HealthcareOnboardingStatus
- Clinical staff onboarding
- Step-by-step workflow tracking
- Document collection
- Progress monitoring

### HealthcareRoles
- Healthcare-specific roles
- HIPAA access levels
- Clinical permissions
- Resource-based access control

### HealthcareAuditLogs
- Patient data access logs
- Compliance audit trail
- Security tracking
- Export functionality

## Key Features (23 APIs)
- Medical staff recruitment
- Credential/license management
- Expiration notifications
- Shift-based payroll
- Onboarding workflows
- HIPAA compliance tracking
- Audit logs

## API Endpoints
Recruitment (5), Credentials (5), Shifts (5), Policies (2), Onboarding (2), Roles (2), Audit (2)

## Related Modules
- **Employee** - Clinical staff
- **Organization** - Healthcare organizations
- **Payroll** - Shift-based payments
