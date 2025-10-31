# Healthcare HR Module

## Overview
The Healthcare module provides specialized HR functionality for medical/clinical organizations with HIPAA compliance, credential tracking, and clinical staff management.

## Purpose
Manage healthcare-specific requirements including medical licenses, HIPAA compliance, clinical workflows, and credential tracking.

## File Structure
```
healthcare/
├── healthcare.schema.js     # Optimized unified schema with embedded subdocuments
├── healthcare.service.js    # Business logic
├── healthcare.controller.js # Request handlers
├── healthcare.routes.js     # API endpoints (23 endpoints)
└── README.md                # This file
```

## Schema

### Healthcare (Unified Schema)
The healthcare module uses a single optimized schema with an `entityType` field to differentiate between different healthcare entities, using embedded subdocuments for better performance and simpler data management.

**Entity Types:**
- **Recruitment** - Medical position recruitment with required credentials, specialty tracking, and HIPAA training requirements
- **Credential** - License/credential management (Medical License, DEA, Board Certification, etc.) with expiration tracking and auto-notification
- **Shift** - Shift scheduling with embedded **assignments[]** for clinical staff, overtime calculations, and required staffing levels
- **Policy** - HIPAA compliance policies, clinical protocols, patient safety policies with acknowledgments tracking
- **Workflow** - Onboarding workflows with embedded **onboardingStatuses[]** for step-by-step tracking, document collection, and progress monitoring
- **Role** - Healthcare-specific roles with HIPAA access levels, clinical permissions, and resource-based access control
- **Audit** - Patient data access logs, compliance audit trail, security tracking with export functionality

**Key Features:**
- Single collection with entityType discrimination
- Embedded subdocuments for related data (shift assignments, onboarding statuses)
- Optimized queries using entityType and subdocument paths
- Maintains all functionality while reducing complexity

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
