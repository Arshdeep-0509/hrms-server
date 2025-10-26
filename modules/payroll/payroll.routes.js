const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const payrollController = require('./payroll.controller');

const router = express.Router();

// Define Role-Based Authorizations
const superAdminOrClientAdmin = authorize(['Super Admin', 'Client Admin']);
const payrollSpecialist = authorize(['Payroll Specialist']);
const payrollOrClientAdmin = authorize(['Payroll Specialist', 'Client Admin']);
const payrollOrBookkeeping = authorize(['Payroll Specialist', 'Bookkeeping']);
const payrollOrEmployee = authorize(['Payroll Specialist', 'Employee']);

// Payroll Management Routes

// 1. View payroll cycles
// GET /api/payroll/cycles
router.get('/cycles', protect, payrollOrClientAdmin, payrollController.listPayrollCycles.bind(payrollController));

// 2. Create new payroll cycle
// POST /api/payroll/cycles
router.post('/cycles', protect, payrollSpecialist, payrollController.createPayrollCycle.bind(payrollController));

// 3. Get payroll cycle by ID
// GET /api/payroll/cycles/:id
router.get('/cycles/:id', protect, payrollOrClientAdmin, payrollController.getPayrollCycle.bind(payrollController));

// 4. Update payroll cycle
// PUT /api/payroll/cycles/:id
router.put('/cycles/:id', protect, payrollSpecialist, payrollController.updatePayrollCycle.bind(payrollController));

// 5. Process payroll for employees
// POST /api/payroll/run
router.post('/run', protect, payrollSpecialist, payrollController.processPayroll.bind(payrollController));

// 6. Fetch payslip for employee
// GET /api/payroll/payslips/:employeeId
router.get('/payslips/:employeeId', protect, payrollOrEmployee, payrollController.getEmployeePayslips.bind(payrollController));

// 7. Get payslip by ID
// GET /api/payroll/payslips/single/:id
router.get('/payslips/single/:id', protect, payrollOrEmployee, payrollController.getPayslip.bind(payrollController));

// 8. Update payslip status
// PUT /api/payroll/payslips/:id/status
router.put('/payslips/:id/status', protect, payrollSpecialist, payrollController.updatePayslipStatus.bind(payrollController));

// 9. View payroll tax details
// GET /api/payroll/taxes
router.get('/taxes', protect, payrollOrBookkeeping, payrollController.listPayrollTaxes.bind(payrollController));

// 10. Create payroll tax record
// POST /api/payroll/taxes
router.post('/taxes', protect, payrollSpecialist, payrollController.createPayrollTax.bind(payrollController));

// 11. Get payroll tax by ID
// GET /api/payroll/taxes/:id
router.get('/taxes/:id', protect, payrollOrBookkeeping, payrollController.getPayrollTax.bind(payrollController));

// 12. Update payroll tax record
// PUT /api/payroll/taxes/:id
router.put('/taxes/:id', protect, payrollSpecialist, payrollController.updatePayrollTax.bind(payrollController));

// 13. File tax reports
// POST /api/payroll/taxes/file
router.post('/taxes/file', protect, payrollSpecialist, payrollController.fileTaxReports.bind(payrollController));

// 14. Generate payroll summaries
// GET /api/payroll/reports
router.get('/reports', protect, payrollOrClientAdmin, payrollController.generatePayrollReports.bind(payrollController));

// 15. Generate payroll report
// POST /api/payroll/reports
router.post('/reports', protect, payrollOrClientAdmin, payrollController.generatePayrollReports.bind(payrollController));

// 16. Get payroll report by ID
// GET /api/payroll/reports/:id
router.get('/reports/:id', protect, payrollOrClientAdmin, payrollController.getPayrollReport.bind(payrollController));

// 17. Download payroll report
// GET /api/payroll/reports/:id/download
router.get('/reports/:id/download', protect, payrollOrClientAdmin, payrollController.downloadPayrollReport.bind(payrollController));

module.exports = router;
