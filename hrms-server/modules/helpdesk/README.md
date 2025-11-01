# Helpdesk Module

## Overview
The Helpdesk module manages support tickets, IT requests, and issue tracking for employee assistance.

## Purpose
Provide a centralized ticketing system for employees to report issues, request IT support, and track resolution progress.

## File Structure
```
helpdesk/
├── helpdesk.schema.js     # Database models
├── helpdesk.service.js    # Business logic
├── helpdesk.controller.js # Request handlers
├── helpdesk.routes.js     # API endpoints
└── README.md              # This file
```

## Schemas

### Ticket
- ticket_id, organization_id, employee_id
- subject, description, category
- priority (Low, Medium, High, Urgent)
- status (Open, In Progress, Resolved, Closed)
- assignedTo (agent assignment)
- comments/updates
- resolution details
- attachments

## Key Features
- Ticket creation and tracking
- Priority management
- Agent assignment
- Status workflow
- Comment threads
- Attachment support
- SLA tracking

## API Endpoints
- `POST /api/tickets` - Create ticket
- `GET /api/tickets` - List tickets
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/comments` - Add comment
- `PUT /api/tickets/:id/assign` - Assign agent
- `PUT /api/tickets/:id/resolve` - Resolve ticket

## Related Modules
- **Employee** - Ticket creators
- **Organization** - Organization-level tickets
- **User** - Assigned agents
