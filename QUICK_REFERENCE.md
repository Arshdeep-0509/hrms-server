# Quick Reference Guide

## Module Structure Pattern

Every module follows this consistent pattern:

```
module-name/
├── module-name.schema.js    # Database model (Mongoose)
├── module-name.service.js   # Business logic
├── module-name.controller.js # HTTP handlers
└── module-name.routes.js    # API routes
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

## Common Patterns

### 1. Service Method Pattern
```javascript
// user.service.js
class UserService {
  async methodName(params) {
    // Validation
    if (!params.required) {
      throw { statusCode: 400, message: 'Required field missing' };
    }
    
    // Business logic
    const result = await Model.findById(params.id);
    
    // Error handling
    if (!result) {
      throw { statusCode: 404, message: 'Resource not found' };
    }
    
    // Return data
    return result;
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
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message });
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

## Adding a New Feature

### Example: Adding a "Department" Module

**Step 1**: Create directory
```bash
mkdir modules/department
```

**Step 2**: Create schema (`department.schema.js`)
```javascript
const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);
```

**Step 3**: Create service (`department.service.js`)
```javascript
const Department = require('./department.schema');

class DepartmentService {
  async getAllDepartments() {
    return await Department.find().populate('managerId', 'name email');
  }

  async createDepartment(data) {
    const { name, description, managerId } = data;
    const department = await Department.create({ name, description, managerId });
    return { message: 'Department created successfully', department };
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
      const departments = await departmentService.getAllDepartments();
      res.json(departments);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async createDepartment(req, res) {
    try {
      const result = await departmentService.createDepartment(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
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
  authorize(['Super Admin']), 
  departmentController.createDepartment.bind(departmentController)
);

module.exports = router;
```

**Step 6**: Register in `index.js`
```javascript
const departmentRoutes = require('./modules/department/department.routes');
app.use('/api/departments', departmentRoutes);
```

## Existing Modules

### Auth Module
- **Purpose**: User authentication
- **Routes**: `/api/auth/*`
- **Key Methods**: `register`, `login`, `logout`

### User Module
- **Purpose**: User profile management
- **Routes**: `/api/users/*`
- **Key Methods**: `getUserProfile`, `updateUserProfile`, `deleteUser`

### Role Module
- **Purpose**: Role and permission management
- **Routes**: `/api/roles/*`
- **Key Methods**: `getAllRolesAndPermissions`, `updateUserRole`, `modifyRoleAccess`

### Organization Module
- **Purpose**: Client organization management
- **Routes**: `/api/organizations/*`
- **Key Methods**: `listOrganizations`, `createOrganization`, `configurePolicies`

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

## Error Throwing Pattern

```javascript
// In service layer
throw { statusCode: 404, message: 'User not found' };
throw { statusCode: 400, message: 'Invalid input data' };
throw { statusCode: 403, message: 'Access denied' };
```

## Tips & Best Practices

1. ✅ **Always use service layer** for business logic
2. ✅ **Keep controllers thin** - just handle request/response
3. ✅ **Throw structured errors** from services with statusCode
4. ✅ **Use async/await** consistently
5. ✅ **Bind controller methods** when using in routes: `.bind(controller)`
6. ✅ **Populate references** when needed: `.populate('field', 'name email')`
7. ✅ **Validate inputs** in service layer before processing
8. ✅ **Use meaningful variable names** and comments
9. ✅ **Follow the existing naming conventions**
10.✅ **Test thoroughly** after making changes

## File Checklist for New Module

- [ ] Create module directory in `modules/`
- [ ] Create `*.schema.js` with Mongoose model
- [ ] Create `*.service.js` with business logic class
- [ ] Create `*.controller.js` with HTTP handlers class
- [ ] Create `*.routes.js` with Express router
- [ ] Export as singleton: `module.exports = new ClassName()`
- [ ] Bind controller methods in routes: `.bind(controller)`
- [ ] Register routes in `index.js`
- [ ] Test all endpoints
- [ ] Update documentation if needed

## Need Help?

- See `PROJECT_STRUCTURE.md` for detailed architecture overview
- See `MIGRATION_SUMMARY.md` for what changed during restructuring
- Check existing modules for reference implementations

