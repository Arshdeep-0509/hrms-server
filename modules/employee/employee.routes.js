const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const employeeController = require('./employee.controller');

const router = express.Router();

// Define Role-Based Authorizations
const superAdminOrClientAdmin = authorize(['Super Admin', 'Client Admin']);
const clientAdminOrHR = authorize(['Client Admin', 'HR Account Manager']);
const hrOrClientAdmin = authorize(['HR Account Manager', 'Client Admin']);
const hrOrEmployee = authorize(['HR Account Manager', 'Employee']);

// Employee Management Routes

// 1. List all employees (with filters)
// GET /api/employees
router.get('/', protect, superAdminOrClientAdmin, employeeController.listEmployees.bind(employeeController));

// 2. Get employee by ID
// GET /api/employees/:employee_id
router.get('/:employee_id', protect, employeeController.getEmployee.bind(employeeController));

// 3. Create new employee
// POST /api/employees
router.post('/', protect, clientAdminOrHR, employeeController.createEmployee.bind(employeeController));

// 4. Update employee details
// PUT /api/employees/:employee_id
router.put('/:employee_id', protect, hrOrClientAdmin, employeeController.updateEmployee.bind(employeeController));

// 5. Update employee status (activate/deactivate/terminate)
// PUT /api/employees/:employee_id/status
router.put('/:employee_id/status', protect, hrOrClientAdmin, employeeController.updateEmployeeStatus.bind(employeeController));

// 6. Upload document for employee
// POST /api/employees/:employee_id/documents
router.post('/:employee_id/documents', protect, hrOrEmployee, employeeController.uploadDocument.bind(employeeController));

// 7. Trigger onboarding workflow
// POST /api/employees/:employee_id/onboarding
router.post('/:employee_id/onboarding', protect, hrOrClientAdmin, employeeController.startOnboarding.bind(employeeController));

// 8. Trigger offboarding workflow
// POST /api/employees/:employee_id/offboarding
router.post('/:employee_id/offboarding', protect, hrOrClientAdmin, employeeController.startOffboarding.bind(employeeController));

module.exports = router;
