const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const leaveController = require('./leave.controller');

const router = express.Router();

// Define Role-Based Authorizations
const superAdminOrClientAdmin = authorize(['Super Admin', 'Client Admin']);

// 1. Apply for leave
// POST /api/leave/apply
router.post('/apply', protect, leaveController.applyForLeave.bind(leaveController));

// 2. Approve or reject leave
// PUT /api/leave/approve/:id
router.put('/approve/:id', protect, superAdminOrClientAdmin, leaveController.approveOrRejectLeave.bind(leaveController));

// 3. Create leave policy
// POST /api/leave/policy/create
router.post('/policy/create', protect, superAdminOrClientAdmin, leaveController.createLeavePolicy.bind(leaveController));

// 4. Get leave balance
// GET /api/leave/balance/:employeeId
router.get('/balance/:employeeId', protect, leaveController.getLeaveBalance.bind(leaveController));

// 5. Get leave reports
// GET /api/leave/reports
router.get('/reports', protect, superAdminOrClientAdmin, leaveController.getLeaveReports.bind(leaveController));

// 6. Add holiday
// POST /api/leave/holidays/add
router.post('/holidays/add', protect, superAdminOrClientAdmin, leaveController.addHoliday.bind(leaveController));

// 7. List holidays
// GET /api/leave/holidays/list?organization_id=123&year=2024
router.get('/holidays/list', protect, superAdminOrClientAdmin, leaveController.listHolidays.bind(leaveController));

// 8. Get calendar view
// GET /api/leave/calendar?organization_id=123&year=2024&month=1
router.get('/calendar', protect, superAdminOrClientAdmin, leaveController.getCalendarView.bind(leaveController));

// 9. Create leave type
// POST /api/leave/type/create
router.post('/type/create', protect, superAdminOrClientAdmin, leaveController.createLeaveType.bind(leaveController));

// 10. List leave types
// GET /api/leave/type/list?organization_id=123
router.get('/type/list', protect, superAdminOrClientAdmin, leaveController.listLeaveTypes.bind(leaveController));

// 11. Update leave type
// PUT /api/leave/type/update/:id
router.put('/type/update/:id', protect, superAdminOrClientAdmin, leaveController.updateLeaveType.bind(leaveController));

module.exports = router;

