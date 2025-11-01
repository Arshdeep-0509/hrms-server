# Quick Reference Guide

## Module Structure Pattern

Every module follows this consistent pattern:

```
module-name/
├── module-name.schema.js    # Database model (Mongoose)
├── module-name.service.js   # Business logic
├── module-name.controller.js # HTTP handlers
├── module-name.routes.js    # API routes
└── README.md                # Module documentation
```

## Layer Responsibilities

| Layer | File | Responsibility | Example |
|-------|------|----------------|---------|
| **Schema** | `*.schema.js` | Database model, validations, hooks | Define User model with password hashing |
| **Service** | `*.service.js` | Business logic, data manipulation | Validate and update user profile |
| **Controller** | `*.controller.js` | Handle HTTP requests/responses | Parse request, call service, send response |
| **Routes** | `*.routes.js` | Define endpoints, apply middleware | `GET /profile` → `controller.getUserProfile` |

## Import Paths

### Within Same Module
```javascript
// In user.controller.js
const userService = require('./user.service');
```

### From Another Module
```javascript
// In role.service.js
const User = require('../user/user.schema');
```

### From Middleware
```javascript
// In any routes file
const { protect, authorize } = require('../../middleware/authMiddleware');
```

### From Shared Models
```javascript
// In any schema file
const Counter = require('../../models/counter.model');
```

## Common Patterns

### 1. Service Method Pattern
```javascript
// user.service.js
class UserService {
  async methodName(params) {
    // Validation
    if (!params.required) {
      throw new Error('Required field missing');
    }
    
    // Business logic
    const result = await Model.findById(params.id);
    
    // Error handling
    if (!result) {
      throw new Error('Resource not found');
    }
    
    // Return data
    return { success: true, data: result };
  }
}

module.exports = new UserService();
```

### 2. Controller Method Pattern
```javascript
// user.controller.js
class UserController {
  async methodName(req, res) {
    try {
      const result = await userService.methodName(req.params);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}

module.exports = new UserController();
```

### 3. Routes Pattern
```javascript
// user.routes.js
const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const userController = require('./user.controller');

const router = express.Router();

// Public route
router.post('/login', userController.login.bind(userController));

// Protected route (authentication required)
router.get('/profile', protect, userController.getProfile.bind(userController));

// Admin-only route (authentication + authorization)
router.delete('/:id', 
  protect, 
  authorize(['Super Admin']), 
  userController.deleteUser.bind(userController)
);

module.exports = router;
```

### 4. Schema Pattern with Auto-Increment
```javascript
// user.schema.js
const mongoose = require('mongoose');
const Counter = require('../../models/counter.model');

const UserSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    unique: true
  },
  // ... other fields
}, { 
  timestamps: true,
  _id: false  // Disable default _id
});

// Pre-save hook for auto-incrementing ID
UserSchema.pre('save', async function(next) {
  if (this.isNew && !this.user_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'user_id',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true, lean: true }
      );
      this.user_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('User', UserSchema);
```

## Adding a New Feature

### Example: Adding a "Department" Module

**Step 1**: Create directory
```bash
mkdir modules/department
```

**Step 2**: Create schema (`department.schema.js`)
```javascript
const mongoose = require('mongoose');
const Counter = require('../../models/counter.model');

const DepartmentSchema = new mongoose.Schema({
  department_id: {
    type: Number,
    unique: true
  },
  organization_id: {
    type: Number,
    required: true,
    ref: 'Organization'
  },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  manager: { type: Number, required: false },
  budget: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active'
  }
}, { 
  timestamps: true,
  _id: false
});

DepartmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.department_id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'department_id',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true, lean: true }
      );
      this.department_id = counter.sequence_value;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Department', DepartmentSchema);
```

**Step 3**: Create service (`department.service.js`)
```javascript
const Department = require('./department.schema');

class DepartmentService {
  async getAllDepartments(organizationId) {
    return await Department.find({ organization_id: organizationId })
      .sort({ name: 1 })
      .lean();
  }

  async createDepartment(data) {
    const department = await Department.create(data);
    return { 
      success: true, 
      message: 'Department created successfully', 
      department 
    };
  }
  
  // Add more methods...
}

module.exports = new DepartmentService();
```

**Step 4**: Create controller (`department.controller.js`)
```javascript
const departmentService = require('./department.service');

class DepartmentController {
  async getAllDepartments(req, res) {
    try {
      const organizationId = req.user.organization_id;
      const departments = await departmentService.getAllDepartments(organizationId);
      res.status(200).json({
        success: true,
        departments,
        total: departments.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async createDepartment(req, res) {
    try {
      const result = await departmentService.createDepartment(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
  
  // Add more methods...
}

module.exports = new DepartmentController();
```

**Step 5**: Create routes (`department.routes.js`)
```javascript
const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const departmentController = require('./department.controller');

const router = express.Router();

router.get('/', 
  protect, 
  departmentController.getAllDepartments.bind(departmentController)
);

router.post('/', 
  protect, 
  authorize(['Super Admin', 'Client Admin']), 
  departmentController.createDepartment.bind(departmentController)
);

module.exports = router;
```

**Step 6**: Register in `index.js`
```javascript
const departmentRoutes = require('./modules/department/department.routes');
app.use('/api/departments', departmentRoutes);
```

**Step 7**: Create README.md
```markdown
# Department Module

## Overview
Brief description...

## Purpose
Purpose of module...

[Follow the pattern from other modules]
```

## Existing Modules

### Core Modules
- **Auth** - `/api/auth` - User authentication
- **User** - `/api/users` - User profile management
- **Role** - `/api/roles` - Role and permission management
- **Organization** - `/api/organizations` - Client organization management

### HR Management
- **Employee** - `/api/employees` - Employee management
- **Department** - `/api/departments` - Department management
- **Recruitment** - `/api/recruitment` - Hiring and talent acquisition

### Time & Attendance
- **Attendance** - `/api/attendance` - Time tracking
- **Leave** - `/api/leave` - Leave management

### Financial
- **Payroll** - `/api/payroll` - Salary processing
- **Finance** - `/api/finance` - Financial transactions
- **Expense** - `/api/expense` - Expense claims

### Specialized
- **Healthcare** - `/api/healthcare` - Healthcare HR operations
- **Helpdesk** - `/api/tickets` - IT support ticketing
- **Asset** - `/api/assets` - Asset management

## Authorization Levels

```javascript
// Public - no authentication
router.post('/login', controller.method);

// Protected - authentication required
router.get('/profile', protect, controller.method);

// Role-based - specific roles only
router.delete('/:id', 
  protect, 
  authorize(['Super Admin', 'Client Admin']), 
  controller.method
);
```

## Common HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PATCH, PUT |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid input/validation error |
| 401 | Unauthorized | Authentication failed |
| 403 | Forbidden | Authorization failed (role issue) |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

## Error Handling Pattern

```javascript
// In service layer
try {
  // business logic
} catch (error) {
  throw new Error('Descriptive error message');
}

// In controller layer
try {
  const result = await service.method();
  res.status(200).json(result);
} catch (error) {
  res.status(500).json({ 
    success: false, 
    message: error.message 
  });
}
```

## ID Patterns

### Numeric Auto-Increment IDs
Used in: User, Role, Department, Employee, Leave, Expense, Asset, etc.

```javascript
// Generated via Counter model
const counter = await Counter.findByIdAndUpdate(
  'field_id',
  { $inc: { sequence_value: 1 } },
  { new: true, upsert: true, lean: true }
);
this.field_id = counter.sequence_value;
```

### Object IDs
Used in: Organization, Mongoose refs

```javascript
// Standard MongoDB ObjectId
organization: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Organization'
}
```

## Tips & Best Practices

1. ✅ **Always use service layer** for business logic
2. ✅ **Keep controllers thin** - just handle request/response
3. ✅ **Throw descriptive errors** from services
4. ✅ **Use async/await** consistently
5. ✅ **Bind controller methods** when using in routes: `.bind(controller)`
6. ✅ **Populate references** when needed: `.populate('field', 'name email')`
7. ✅ **Validate inputs** in service layer before processing
8. ✅ **Use meaningful variable names** and comments
9. ✅ **Follow the existing naming conventions**
10. ✅ **Test thoroughly** after making changes
11. ✅ **Update documentation** when adding features
12. ✅ **Use numeric IDs** where specified for consistency

## File Checklist for New Module

- [ ] Create module directory in `modules/`
- [ ] Create `*.schema.js` with Mongoose model
- [ ] Create `*.service.js` with business logic class
- [ ] Create `*.controller.js` with HTTP handlers class
- [ ] Create `*.routes.js` with Express router
- [ ] Export as singleton: `module.exports = new ClassName()`
- [ ] Bind controller methods in routes: `.bind(controller)`
- [ ] Register routes in `index.js`
- [ ] Create `README.md` with module documentation
- [ ] Test all endpoints
- [ ] Update main README if needed
- [ ] Update PROJECT_STRUCTURE.md if needed
- [ ] Update QUICK_REFERENCE.md if needed

## Need Help?

- See `README.md` for project overview
- See `PROJECT_STRUCTURE.md` for detailed architecture overview
- Check existing modules for reference implementations
- Each module has its own README with detailed information

## Quick Access to Module Documentation

- [Auth Module](./modules/auth/README.md)
- [User Module](./modules/user/README.md)
- [Role Module](./modules/role/README.md)
- [Organization Module](./modules/organization/README.md)
- [Employee Module](./modules/employee/README.md)
- [Department Module](./modules/department/README.md)
- [Attendance Module](./modules/attendance/README.md)
- [Leave Module](./modules/leave/README.md)
- [Payroll Module](./modules/payroll/README.md)
- [Finance Module](./modules/finance/README.md)
- [Expense Module](./modules/expense/README.md)
- [Recruitment Module](./modules/recruitment/README.md)
- [Healthcare Module](./modules/healthcare/README.md)
- [Helpdesk Module](./modules/helpdesk/README.md)
- [Asset Module](./modules/asset/README.md)