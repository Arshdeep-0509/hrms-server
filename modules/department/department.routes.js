const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const departmentController = require('./department.controller');

const router = express.Router();

// Define Role-Based Authorizations
const superAdminOrClientAdmin = authorize(['Super Admin', 'Client Admin']);
const clientAdminOnly = authorize(['Client Admin']);

// 1. List departments (optionally by org)
// GET /api/departments?organization_id=123
router.get('/', protect, superAdminOrClientAdmin, departmentController.listDepartments.bind(departmentController));

// 2. View department details
// GET /api/departments/:id
router.get('/:id', protect, superAdminOrClientAdmin, departmentController.getDepartmentDetails.bind(departmentController));

// 3. Create new department
// POST /api/departments
router.post('/', protect, superAdminOrClientAdmin, departmentController.createDepartment.bind(departmentController));

// 4. Update department info
// PUT /api/departments/:id
router.put('/:id', protect, superAdminOrClientAdmin, departmentController.updateDepartment.bind(departmentController));

// 5. Delete department
// DELETE /api/departments/:id
router.delete('/:id', protect, superAdminOrClientAdmin, departmentController.deleteDepartment.bind(departmentController));

// 6. Create new role within department
// POST /api/departments/:id/roles
router.post('/:id/roles', protect, clientAdminOnly, departmentController.createRoleInDepartment.bind(departmentController));

// 7. Assign employee to department
// POST /api/departments/:id/assign-user
router.post('/:id/assign-user', protect, clientAdminOnly, departmentController.assignEmployeeToDepartment.bind(departmentController));

module.exports = router;

