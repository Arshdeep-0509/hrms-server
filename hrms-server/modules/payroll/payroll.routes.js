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

/**
 * @swagger
 * /api/payroll/cycles:
 *   get:
 *     summary: View payroll cycles
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, In Progress, Completed, Cancelled]
 *         description: Filter by cycle status
 *       - in: query
 *         name: cycleType
 *         schema:
 *           type: string
 *           enum: [Monthly, Bi-weekly, Weekly, Custom]
 *         description: Filter by cycle type
 *       - in: query
 *         name: dateRange
 *         schema:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *             endDate:
 *               type: string
 *               format: date
 *         description: Filter by date range
 *     responses:
 *       200:
 *         description: Payroll cycles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PayrollCycle'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/cycles', protect, payrollOrClientAdmin, payrollController.listPayrollCycles.bind(payrollController));

/**
 * @swagger
 * /api/payroll/cycles:
 *   post:
 *     summary: Create new payroll cycle
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cycle_id
 *               - organization_id
 *               - name
 *               - payPeriod
 *               - payDate
 *               - cycleType
 *             properties:
 *               cycle_id:
 *                 type: integer
 *                 description: Unique cycle identifier
 *               organization_id:
 *                 type: integer
 *                 description: Organization ID
 *               name:
 *                 type: string
 *                 description: Cycle name
 *               description:
 *                 type: string
 *                 description: Cycle description
 *               payPeriod:
 *                 type: object
 *                 required:
 *                   - startDate
 *                   - endDate
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     description: Pay period start date
 *                   endDate:
 *                     type: string
 *                     format: date
 *                     description: Pay period end date
 *               payDate:
 *                 type: string
 *                 format: date
 *                 description: Payment date
 *               cycleType:
 *                 type: string
 *                 enum: [Monthly, Bi-weekly, Weekly, Custom]
 *                 description: Cycle type
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Payroll cycle created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cycle:
 *                   $ref: '#/components/schemas/PayrollCycle'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/cycles', protect, payrollSpecialist, payrollController.createPayrollCycle.bind(payrollController));

/**
 * @swagger
 * /api/payroll/cycles/{id}:
 *   get:
 *     summary: Get payroll cycle by ID
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll cycle ID
 *     responses:
 *       200:
 *         description: Payroll cycle retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PayrollCycle'
 *       404:
 *         description: Payroll cycle not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/cycles/:id', protect, payrollOrClientAdmin, payrollController.getPayrollCycle.bind(payrollController));

/**
 * @swagger
 * /api/payroll/cycles/{id}:
 *   put:
 *     summary: Update payroll cycle
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll cycle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Cycle name
 *               description:
 *                 type: string
 *                 description: Cycle description
 *               payPeriod:
 *                 type: object
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *               payDate:
 *                 type: string
 *                 format: date
 *                 description: Payment date
 *               status:
 *                 type: string
 *                 enum: [Draft, In Progress, Completed, Cancelled]
 *                 description: Cycle status
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: Payroll cycle updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cycle:
 *                   $ref: '#/components/schemas/PayrollCycle'
 *       404:
 *         description: Payroll cycle not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/cycles/:id', protect, payrollSpecialist, payrollController.updatePayrollCycle.bind(payrollController));

/**
 * @swagger
 * /api/payroll/run:
 *   post:
 *     summary: Process payroll for employees
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cycle_id
 *               - organization_id
 *             properties:
 *               cycle_id:
 *                 type: string
 *                 description: Payroll cycle ID
 *               organization_id:
 *                 type: integer
 *                 description: Organization ID
 *               employeeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific employee IDs to process (optional)
 *               includeOvertime:
 *                 type: boolean
 *                 default: true
 *                 description: Include overtime calculations
 *               includeDeductions:
 *                 type: boolean
 *                 default: true
 *                 description: Include deductions
 *               includeBenefits:
 *                 type: boolean
 *                 default: true
 *                 description: Include benefits
 *     responses:
 *       200:
 *         description: Payroll processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 payroll:
 *                   type: object
 *                   properties:
 *                     payroll_id:
 *                       type: string
 *                     totalEmployees:
 *                       type: integer
 *                     totalGrossPay:
 *                       type: number
 *                     totalDeductions:
 *                       type: number
 *                     totalNetPay:
 *                       type: number
 *                     processedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/run', protect, payrollSpecialist, payrollController.processPayroll.bind(payrollController));

/**
 * @swagger
 * /api/payroll/payslips/{employeeId}:
 *   get:
 *     summary: Fetch payslips for employee
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Filter by month
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Generated, Approved, Paid, Cancelled]
 *         description: Filter by payslip status
 *     responses:
 *       200:
 *         description: Employee payslips retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payslip'
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/payslips/:employeeId', protect, payrollOrEmployee, payrollController.getEmployeePayslips.bind(payrollController));

/**
 * @swagger
 * /api/payroll/payslips/single/{id}:
 *   get:
 *     summary: Get payslip by ID
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payslip ID
 *     responses:
 *       200:
 *         description: Payslip retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payslip'
 *       404:
 *         description: Payslip not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/payslips/single/:id', protect, payrollOrEmployee, payrollController.getPayslip.bind(payrollController));

/**
 * @swagger
 * /api/payroll/payslips/{id}/status:
 *   put:
 *     summary: Update payslip status
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payslip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Generated, Approved, Paid, Cancelled]
 *                 description: New payslip status
 *               notes:
 *                 type: string
 *                 description: Status change notes
 *               approvedBy:
 *                 type: string
 *                 description: User who approved the payslip
 *     responses:
 *       200:
 *         description: Payslip status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 payslip:
 *                   $ref: '#/components/schemas/Payslip'
 *       404:
 *         description: Payslip not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/payslips/:id/status', protect, payrollSpecialist, payrollController.updatePayslipStatus.bind(payrollController));

/**
 * @swagger
 * /api/payroll/taxes:
 *   get:
 *     summary: View payroll tax details
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organization_id
 *         schema:
 *           type: integer
 *         description: Filter by organization ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by tax year
 *       - in: query
 *         name: quarter
 *         schema:
 *           type: integer
 *         description: Filter by quarter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Filed, Paid, Overdue]
 *         description: Filter by tax status
 *     responses:
 *       200:
 *         description: Payroll taxes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tax_id:
 *                     type: string
 *                   organization_id:
 *                     type: integer
 *                   taxType:
 *                     type: string
 *                   taxYear:
 *                     type: integer
 *                   quarter:
 *                     type: integer
 *                   amount:
 *                     type: number
 *                   dueDate:
 *                     type: string
 *                     format: date
 *                   status:
 *                     type: string
 *                   filedDate:
 *                     type: string
 *                     format: date
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/taxes', protect, payrollOrBookkeeping, payrollController.listPayrollTaxes.bind(payrollController));

/**
 * @swagger
 * /api/payroll/taxes:
 *   post:
 *     summary: Create payroll tax record
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organization_id
 *               - taxType
 *               - taxYear
 *               - amount
 *             properties:
 *               organization_id:
 *                 type: integer
 *                 description: Organization ID
 *               taxType:
 *                 type: string
 *                 enum: [Federal Income Tax, State Income Tax, Social Security, Medicare, Unemployment, Local Tax]
 *                 description: Type of tax
 *               taxYear:
 *                 type: integer
 *                 description: Tax year
 *               quarter:
 *                 type: integer
 *                 description: Quarter (1-4)
 *               amount:
 *                 type: number
 *                 description: Tax amount
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Tax due date
 *               description:
 *                 type: string
 *                 description: Tax description
 *     responses:
 *       201:
 *         description: Payroll tax record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tax:
 *                   type: object
 *                   properties:
 *                     tax_id:
 *                       type: string
 *                     taxType:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     dueDate:
 *                       type: string
 *                       format: date
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/taxes', protect, payrollSpecialist, payrollController.createPayrollTax.bind(payrollController));

/**
 * @swagger
 * /api/payroll/taxes/{id}:
 *   get:
 *     summary: Get payroll tax by ID
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tax ID
 *     responses:
 *       200:
 *         description: Payroll tax retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tax_id:
 *                   type: string
 *                 organization_id:
 *                   type: integer
 *                 taxType:
 *                   type: string
 *                 taxYear:
 *                   type: integer
 *                 quarter:
 *                   type: integer
 *                 amount:
 *                   type: number
 *                 dueDate:
 *                   type: string
 *                   format: date
 *                 status:
 *                   type: string
 *                 filedDate:
 *                   type: string
 *                   format: date
 *       404:
 *         description: Tax record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/taxes/:id', protect, payrollOrBookkeeping, payrollController.getPayrollTax.bind(payrollController));

/**
 * @swagger
 * /api/payroll/taxes/{id}:
 *   put:
 *     summary: Update payroll tax record
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tax ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taxType:
 *                 type: string
 *                 enum: [Federal Income Tax, State Income Tax, Social Security, Medicare, Unemployment, Local Tax]
 *               amount:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Pending, Filed, Paid, Overdue]
 *               filedDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payroll tax record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tax:
 *                   type: object
 *       404:
 *         description: Tax record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/taxes/:id', protect, payrollSpecialist, payrollController.updatePayrollTax.bind(payrollController));

/**
 * @swagger
 * /api/payroll/taxes/file:
 *   post:
 *     summary: File tax reports
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organization_id
 *               - taxYear
 *               - reportType
 *             properties:
 *               organization_id:
 *                 type: integer
 *                 description: Organization ID
 *               taxYear:
 *                 type: integer
 *                 description: Tax year
 *               quarter:
 *                 type: integer
 *                 description: Quarter (1-4)
 *               reportType:
 *                 type: string
 *                 enum: [941, 940, W-2, W-3, State Tax Return]
 *                 description: Type of tax report
 *               filingMethod:
 *                 type: string
 *                 enum: [Electronic, Paper]
 *                 default: Electronic
 *                 description: Filing method
 *               notes:
 *                 type: string
 *                 description: Filing notes
 *     responses:
 *       200:
 *         description: Tax report filed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 filing:
 *                   type: object
 *                   properties:
 *                     filing_id:
 *                       type: string
 *                     reportType:
 *                       type: string
 *                     taxYear:
 *                       type: integer
 *                     filedDate:
 *                       type: string
 *                       format: date-time
 *                     confirmationNumber:
 *                       type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/taxes/file', protect, payrollSpecialist, payrollController.fileTaxReports.bind(payrollController));

/**
 * @swagger
 * /api/payroll/reports:
 *   get:
 *     summary: Generate payroll summaries
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organization_id
 *         schema:
 *           type: integer
 *         description: Organization ID
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [Summary, Detailed, Tax, Benefits, Overtime]
 *         description: Type of payroll report
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Report start date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Report end date
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [JSON, PDF, Excel]
 *           default: JSON
 *         description: Report format
 *     responses:
 *       200:
 *         description: Payroll report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 report:
 *                   type: object
 *                   properties:
 *                     report_id:
 *                       type: string
 *                     reportType:
 *                       type: string
 *                     totalEmployees:
 *                       type: integer
 *                     totalGrossPay:
 *                       type: number
 *                     totalDeductions:
 *                       type: number
 *                     totalNetPay:
 *                       type: number
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/reports', protect, payrollOrClientAdmin, payrollController.generatePayrollReports.bind(payrollController));

/**
 * @swagger
 * /api/payroll/reports:
 *   post:
 *     summary: Generate payroll report
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organization_id
 *               - reportType
 *             properties:
 *               organization_id:
 *                 type: integer
 *                 description: Organization ID
 *               reportType:
 *                 type: string
 *                 enum: [Summary, Detailed, Tax, Benefits, Overtime]
 *                 description: Type of payroll report
 *               dateFrom:
 *                 type: string
 *                 format: date
 *                 description: Report start date
 *               dateTo:
 *                 type: string
 *                 format: date
 *                 description: Report end date
 *               employeeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific employee IDs to include
 *               format:
 *                 type: string
 *                 enum: [JSON, PDF, Excel]
 *                 default: JSON
 *                 description: Report format
 *               includeDetails:
 *                 type: boolean
 *                 default: false
 *                 description: Include detailed breakdown
 *     responses:
 *       200:
 *         description: Payroll report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 report:
 *                   type: object
 *                   properties:
 *                     report_id:
 *                       type: string
 *                     reportType:
 *                       type: string
 *                     totalEmployees:
 *                       type: integer
 *                     totalGrossPay:
 *                       type: number
 *                     totalDeductions:
 *                       type: number
 *                     totalNetPay:
 *                       type: number
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/reports', protect, payrollOrClientAdmin, payrollController.generatePayrollReports.bind(payrollController));

/**
 * @swagger
 * /api/payroll/reports/{id}:
 *   get:
 *     summary: Get payroll report by ID
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Payroll report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report_id:
 *                   type: string
 *                 reportType:
 *                   type: string
 *                 organization_id:
 *                   type: integer
 *                 dateFrom:
 *                   type: string
 *                   format: date
 *                 dateTo:
 *                   type: string
 *                   format: date
 *                 totalEmployees:
 *                   type: integer
 *                 totalGrossPay:
 *                   type: number
 *                 totalDeductions:
 *                   type: number
 *                 totalNetPay:
 *                   type: number
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                 data:
 *                   type: object
 *                   description: Report data
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/reports/:id', protect, payrollOrClientAdmin, payrollController.getPayrollReport.bind(payrollController));

/**
 * @swagger
 * /api/payroll/reports/{id}/download:
 *   get:
 *     summary: Download payroll report
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [PDF, Excel, CSV]
 *           default: PDF
 *         description: Download format
 *     responses:
 *       200:
 *         description: Report downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/reports/:id/download', protect, payrollOrClientAdmin, payrollController.downloadPayrollReport.bind(payrollController));

module.exports = router;
