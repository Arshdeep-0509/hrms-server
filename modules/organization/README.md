# Organization Module

## Overview
The Organization module manages client organizations in a multi-tenant HRMS system where multiple organizations can be served by the platform.

## Purpose
This module handles organization-level data, settings, and configuration for each client organization in the system.

## File Structure
```
organization/
├── organization.schema.js    # Organization database model
├── organization.service.js   # Business logic for organization operations
├── organization.controller.js # HTTP request handlers
├── organization.routes.js    # API endpoint definitions
└── README.md                 # This file
```

## Schema: Organization Model

### Fields
- **organization_id** (Number, unique, required) - Auto-incrementing numeric ID
- **name** (String, required, unique) - Organization name
- **clientAdmin** (String, optional) - Reference to Client Admin user
- **hrAccountManager** (String, optional) - Reference to HR Account Manager
- **address** (Object) - Organization address
  - street, city, zipCode, country
- **subscriptionPlan** (String, enum) - Plan tier (Basic, Standard, Premium)
- **settings** (Object) - Organization-specific settings
  - payrollCycle - Weekly, Bi-Weekly, Monthly
  - ptoPolicy - PTO days per year

### Auto-Generated Fields
- `organization_id` - Auto-incremented before saving
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## Service Methods

### `listOrganizations()`
Lists all organizations in the system.
- **Returns**: Array of organization objects
- **Use**: Display all client organizations

### `createOrganization(orgData)`
Creates a new organization.
- **Parameters**: orgData object
- **Returns**: Created organization object
- **Throws**: Name already exists

### `getOrganizationById(orgId)`
Retrieves detailed organization information.
- **Parameters**: orgId
- **Returns**: Organization object
- **Throws**: Organization not found

### `updateOrganization(orgId, updateData)`
Updates organization information.
- **Parameters**: orgId, updateData
- **Returns**: Updated organization object
- **Throws**: Organization not found

### `deleteOrganization(orgId)`
Deletes an organization.
- **Parameters**: orgId
- **Returns**: Success message
- **Throws**: Organization not found

### `configureSettings(orgId, settings)`
Configures organization-specific settings.
- **Parameters**: orgId, settings
- **Returns**: Updated settings
- **Use**: Update payroll cycle, PTO policy, etc.

### `assignAccountManager(orgId, managerUserId)`
Assigns HR Account Manager to organization.
- **Parameters**: orgId, managerUserId
- **Returns**: Success message

## API Endpoints

### Organization Routes (Most require authentication)
- `GET /api/organizations/` - List all organizations
- `POST /api/organizations/` - Create new organization (Super Admin only)
- `GET /api/organizations/:id` - Get organization details
- `PUT /api/organizations/:id` - Update organization (Super Admin only)
- `DELETE /api/organizations/:id` - Delete organization (Super Admin only)
- `PUT /api/organizations/:id/settings` - Configure settings (Client Admin only)
- `POST /api/organizations/:id/assign-account-manager` - Assign HR manager (Super Admin only)

## Usage Examples

### Create Organization
```javascript
// In controller
const org = await orgService.createOrganization({
  name: 'Acme Corp',
  address: {
    street: '123 Main St',
    city: 'New York',
    zipCode: '10001',
    country: 'USA'
  },
  subscriptionPlan: 'Premium'
});
```

### Get Organization
```javascript
// In controller
const org = await orgService.getOrganizationById(req.params.id);
```

### Configure Settings
```javascript
// In controller
const result = await orgService.configureSettings(orgId, {
  payrollCycle: 'Monthly',
  ptoPolicy: 20
});
```

## Multi-Tenancy
The system supports multiple organizations where:
- Each organization has its own employees and data
- Settings can be customized per organization
- Users belong to specific organizations
- Data isolation is maintained

## Subscription Plans
- **Basic** - Limited features, basic support
- **Standard** - Enhanced features, priority support
- **Premium** - All features, dedicated support

## Related Modules
- **User Module**: Client Admin and HR Managers
- **Employee Module**: Organization employees
- **Department Module**: Organizational departments
- **Payroll Module**: Organization payroll cycles

## Dependencies
- `mongoose` - Database ODM

## Best Practices
1. Always validate organization_id exists
2. Use organization_id for data filtering
3. Implement proper access control per organization
4. Maintain data isolation between organizations
