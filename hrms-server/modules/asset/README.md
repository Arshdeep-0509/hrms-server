# Asset Management Module

## Overview
The Asset Management module tracks company-owned assets including IT equipment, furniture, vehicles, and more.

## Purpose
Manage asset lifecycle from registration to disposal, track assignments, schedule maintenance, and calculate depreciation.

## File Structure
```
asset/
├── asset.schema.js        # Optimized unified schema with embedded subdocuments
├── asset.service.js       # Business logic
├── asset.controller.js    # Request handlers
├── asset.routes.js        # API endpoints (18 endpoints)
└── README.md              # This file
```

## Schema

### Asset (Unified Schema)
The asset module uses a single optimized schema with embedded subdocuments for better performance and simpler data management.

**Main Fields:**
- asset_id, organization_id
- assetCode (auto-generated)
- category (IT Equipment, Furniture, Vehicles, etc.)
- brand, model, serialNumber
- purchase details
- assignedTo (employee or department)
- warranty information
- depreciation calculations
- QR/barcode support

**Embedded Subdocuments:**
- **history[]** - Complete audit trail (assignments, transfers, returns, maintenance, disposal)
- **maintenanceSchedules[]** - Scheduled maintenance with types, vendors, costs, recurring schedules
- **reports[]** - Lost/damaged reports with incident tracking and resolution status
- **disposal** - Disposal records with documentation and approval workflow

## Key Features (18 APIs)
- Asset registration
- Assignment to employees/departments
- Transfer and return tracking
- Maintenance scheduling
- Depreciation calculations
- QR/barcode scanning
- Disposal management

## API Endpoints
Management (5), Assignment (4), Maintenance (2), Warranty (1), Depreciation (1), Reporting (3), Scanning (2)

## Related Modules
- **Employee** - Asset assignments
- **Department** - Department assets
- **Organization** - Organization assets
