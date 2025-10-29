# Helpdesk / Ticket Management Module

This module provides comprehensive ticket management functionality for internal support systems including HR, IT, Payroll, Finance, and other departments.

## Features

### Core Ticket Management
- **Ticket Creation**: Create support tickets with detailed categorization
- **Ticket Assignment**: Assign tickets to support agents
- **Status Management**: Track ticket status through workflow stages
- **Priority Management**: Set and update ticket priority levels
- **SLA Management**: Automatic SLA deadline calculation and tracking

### Workflow & Escalation
- **Ticket Escalation**: Escalate tickets to higher support levels
- **Assignment History**: Track all ticket assignments and changes
- **Status History**: Complete audit trail of status changes
- **Priority History**: Track priority changes with reasons

### Communication & Collaboration
- **Comments System**: Add internal and external comments
- **File Attachments**: Upload and manage ticket attachments
- **Real-time Updates**: Track all ticket activities

### Analytics & Reporting
- **Ticket Analytics**: Comprehensive reporting dashboard
- **Agent Performance**: Individual agent performance metrics
- **Category Analysis**: Category-wise issue distribution
- **SLA Performance**: Track SLA compliance and overdue tickets

## API Endpoints

### Basic Ticket Management
- `GET /api/tickets` - List all tickets with filters
- `GET /api/tickets/list` - View tickets (own or department-wise)
- `POST /api/tickets/create` - Create a new support ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/update/:id` - Update ticket details
- `DELETE /api/tickets/delete/:id` - Remove (soft-delete) ticket

### Ticket Workflow & Escalation
- `PUT /api/tickets/assign/:id` - Assign ticket to agent
- `PUT /api/tickets/status/:id` - Update ticket status
- `PUT /api/tickets/escalate/:id` - Escalate to higher level
- `PUT /api/tickets/priority/update/:id` - Change priority or SLA
- `POST /api/tickets/comments/add` - Add internal comment or note
- `POST /api/tickets/attachments/upload` - Upload file to ticket

### Ticket Analytics
- `GET /api/tickets/reports/summary` - Ticket volume & status report
- `GET /api/tickets/reports/agent/:id` - Agent performance stats
- `GET /api/tickets/reports/category` - Category-wise issue analysis

## Ticket Categories

- **HR**: Human resources related issues
- **IT**: Technical support and IT infrastructure
- **Payroll**: Payroll and compensation issues
- **Finance**: Financial and accounting matters
- **General**: General administrative issues
- **Technical**: Technical problems and bugs
- **Account**: Account and access management
- **Other**: Miscellaneous issues

## Ticket Statuses

- **Open**: Newly created ticket
- **Pending**: Ticket assigned but not yet started
- **In Progress**: Ticket being actively worked on
- **Resolved**: Issue resolved, awaiting confirmation
- **Closed**: Ticket closed and confirmed
- **Escalated**: Ticket escalated to higher level

## Priority Levels

- **Low**: Non-urgent issues
- **Medium**: Standard priority issues
- **High**: Important issues requiring attention
- **Critical**: Urgent issues requiring immediate attention

## SLA Management

The system automatically calculates SLA deadlines based on priority:
- **Critical**: 1 hour response, 4 hours resolution
- **High**: 4 hours response, 24 hours resolution
- **Medium/Low**: 24 hours response, 72 hours resolution

## Access Control

### Super Admin
- Full access to all tickets across all organizations
- Can manage all aspects of the helpdesk system

### Client Admin
- Access to tickets within their organization
- Can manage tickets and view analytics

### Support Staff / HR Account Manager
- Can manage assigned tickets
- Can view analytics and reports
- Can assign and escalate tickets

### Employee
- Can create tickets
- Can view and update their own tickets
- Can add comments and attachments to their tickets

## Database Schema

The ticket schema includes:
- Basic ticket information (title, description, category)
- Status and priority management
- SLA tracking and deadlines
- Assignment and escalation history
- Comments and attachments
- Time tracking and analytics
- Soft delete functionality

## Usage Examples

### Creating a Ticket
```javascript
POST /api/tickets/create
{
  "title": "Email access issue",
  "description": "Unable to access company email account",
  "category": "IT",
  "priority": "High",
  "tags": ["email", "access"],
  "impact": "High",
  "urgency": "High"
}
```

### Assigning a Ticket
```javascript
PUT /api/tickets/assign/12345
{
  "assignedTo": "user_id_here",
  "reason": "Assigned to IT support team"
}
```

### Adding a Comment
```javascript
POST /api/tickets/comments/add
{
  "ticket_id": "12345",
  "comment": "Issue resolved by resetting password",
  "isInternal": false
}
```

### Getting Analytics
```javascript
GET /api/tickets/reports/summary?dateFrom=2024-01-01&dateTo=2024-01-31
```

## Integration

This module integrates with:
- **User Management**: For authentication and user information
- **Organization Management**: For multi-tenant support
- **Employee Management**: For requester information
- **Counter Model**: For generating unique ticket IDs

## Future Enhancements

- Email notifications for ticket updates
- SMS notifications for critical tickets
- Integration with external ticketing systems
- Advanced workflow automation
- Customer satisfaction surveys
- Knowledge base integration
- Mobile app support
