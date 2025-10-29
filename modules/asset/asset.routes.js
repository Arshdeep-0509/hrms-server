const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const assetController = require('./asset.controller');

const router = express.Router();

// Define Role-Based Authorizations
const adminOnly = authorize(['Super Admin', 'Client Admin']);
const adminOrManager = authorize(['Super Admin', 'Client Admin', 'HR Account Manager']);
const adminOrEmployee = authorize(['Super Admin', 'Client Admin', 'HR Account Manager', 'Employee']);
const financeOnly = authorize(['Finance', 'Super Admin', 'Client Admin']);
const allUsers = authorize(['Super Admin', 'Client Admin', 'HR Account Manager', 'Employee', 'Payroll Specialist', 'Bookkeeping']);

// ==================== ASSET MANAGEMENT ROUTES ====================

/**
 * @swagger
 * /api/assets/register:
 *   post:
 *     summary: Register new asset with details
 *     tags: [Asset Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assetName
 *               - category
 *               - purchaseDate
 *               - purchasePrice
 *             properties:
 *               assetName:
 *                 type: string
 *                 description: Name of the asset
 *               category:
 *                 type: string
 *                 enum: [IT Equipment, Furniture, Office Equipment, Vehicles, Machinery, Tools, Electronics, Appliances, Other]
 *                 description: Asset category
 *               subCategory:
 *                 type: string
 *                 description: Asset sub-category
 *               brand:
 *                 type: string
 *                 description: Asset brand
 *               model:
 *                 type: string
 *                 description: Asset model
 *               serialNumber:
 *                 type: string
 *                 description: Serial number
 *               description:
 *                 type: string
 *                 description: Asset description
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *                 description: Purchase date
 *               purchasePrice:
 *                 type: number
 *                 description: Purchase price
 *               currency:
 *                 type: string
 *                 enum: [USD, INR, EUR, GBP, CAD, AUD, JPY]
 *                 default: USD
 *               supplier:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   contact:
 *                     type: string
 *                   address:
 *                     type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   building:
 *                     type: string
 *                   floor:
 *                     type: string
 *                   room:
 *                     type: string
 *                   address:
 *                     type: string
 *               condition:
 *                 type: string
 *                 enum: [Excellent, Good, Fair, Poor, Damaged]
 *                 default: Good
 *               warranty:
 *                 type: object
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *                   provider:
 *                     type: string
 *                   terms:
 *                     type: string
 *               depreciation:
 *                 type: object
 *                 properties:
 *                   method:
 *                     type: string
 *                     enum: [Straight Line, Declining Balance, Sum of Years, Units of Production]
 *                     default: Straight Line
 *                   usefulLife:
 *                     type: number
 *                     default: 5
 *                   residualValue:
 *                     type: number
 *                     default: 0
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Asset registered successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/register', protect, adminOnly, assetController.registerAsset.bind(assetController));

/**
 * @swagger
 * /api/assets/list:
 *   get:
 *     summary: Get all assets with filters
 *     tags: [Asset Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [IT Equipment, Furniture, Office Equipment, Vehicles, Machinery, Tools, Electronics, Appliances, Other]
 *         description: Filter by asset category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Available, Assigned, In Maintenance, Lost, Damaged, Disposed, Retired]
 *         description: Filter by asset status
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *           enum: [Excellent, Good, Fair, Poor, Damaged]
 *         description: Filter by asset condition
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *           enum: [Employee, Department, unassigned]
 *         description: Filter by assignment type
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: integer
 *         description: Filter by assigned employee
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *         description: Filter by assigned department
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in asset name, code, serial number, brand, model
 *     responses:
 *       200:
 *         description: Assets retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/list', protect, adminOrManager, assetController.listAssets.bind(assetController));

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Get asset details
 *     tags: [Asset Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: Asset details retrieved successfully
 *       404:
 *         description: Asset not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, adminOrEmployee, assetController.getAssetById.bind(assetController));

/**
 * @swagger
 * /api/assets/update/{id}:
 *   put:
 *     summary: Update asset info
 *     tags: [Asset Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assetName:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [IT Equipment, Furniture, Office Equipment, Vehicles, Machinery, Tools, Electronics, Appliances, Other]
 *               subCategory:
 *                 type: string
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *               description:
 *                 type: string
 *               condition:
 *                 type: string
 *                 enum: [Excellent, Good, Fair, Poor, Damaged]
 *               location:
 *                 type: object
 *                 properties:
 *                   building:
 *                     type: string
 *                   floor:
 *                     type: string
 *                   room:
 *                     type: string
 *                   address:
 *                     type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *       404:
 *         description: Asset not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.put('/update/:id', protect, adminOnly, assetController.updateAsset.bind(assetController));

/**
 * @swagger
 * /api/assets/delete/{id}:
 *   delete:
 *     summary: Delete an asset record
 *     tags: [Asset Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: Asset deleted successfully
 *       404:
 *         description: Asset not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.delete('/delete/:id', protect, adminOnly, assetController.deleteAsset.bind(assetController));

// ==================== ASSET ASSIGNMENT ROUTES ====================

/**
 * @swagger
 * /api/assets/assign:
 *   post:
 *     summary: Assign asset to employee or department
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *               - assignTo
 *               - assignType
 *             properties:
 *               asset_id:
 *                 type: integer
 *                 description: Asset ID
 *               assignTo:
 *                 type: integer
 *                 description: Employee ID or Department ID
 *               assignType:
 *                 type: string
 *                 enum: [Employee, Department]
 *                 description: Assignment type
 *               reason:
 *                 type: string
 *                 description: Assignment reason
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Asset assigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/assign', protect, adminOnly, assetController.assignAsset.bind(assetController));

/**
 * @swagger
 * /api/assets/return:
 *   post:
 *     summary: Mark asset as returned
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *             properties:
 *               asset_id:
 *                 type: integer
 *                 description: Asset ID
 *               reason:
 *                 type: string
 *                 description: Return reason
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *               condition:
 *                 type: string
 *                 enum: [Excellent, Good, Fair, Poor, Damaged]
 *                 description: Asset condition upon return
 *     responses:
 *       201:
 *         description: Asset returned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/return', protect, adminOnly, assetController.returnAsset.bind(assetController));

/**
 * @swagger
 * /api/assets/transfer:
 *   post:
 *     summary: Transfer asset between users/departments
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *               - fromType
 *               - fromId
 *               - toType
 *               - toId
 *             properties:
 *               asset_id:
 *                 type: integer
 *                 description: Asset ID
 *               fromType:
 *                 type: string
 *                 enum: [Employee, Department]
 *                 description: Current assignment type
 *               fromId:
 *                 type: integer
 *                 description: Current employee/department ID
 *               toType:
 *                 type: string
 *                 enum: [Employee, Department]
 *                 description: New assignment type
 *               toId:
 *                 type: integer
 *                 description: New employee/department ID
 *               reason:
 *                 type: string
 *                 description: Transfer reason
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Asset transferred successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/transfer', protect, adminOnly, assetController.transferAsset.bind(assetController));

/**
 * @swagger
 * /api/assets/logs/{id}:
 *   get:
 *     summary: View transfer/return logs
 *     tags: [Asset Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: Asset logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/logs/:id', protect, adminOnly, assetController.getAssetLogs.bind(assetController));

// ==================== MAINTENANCE ROUTES ====================

/**
 * @swagger
 * /api/assets/maintenance/schedule:
 *   post:
 *     summary: Schedule asset maintenance
 *     tags: [Asset Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *               - maintenanceType
 *               - title
 *               - scheduledDate
 *               - assignedTo
 *             properties:
 *               asset_id:
 *                 type: integer
 *                 description: Asset ID
 *               maintenanceType:
 *                 type: string
 *                 enum: [Preventive, Corrective, Emergency, Routine, Inspection]
 *                 description: Type of maintenance
 *               title:
 *                 type: string
 *                 description: Maintenance title
 *               description:
 *                 type: string
 *                 description: Maintenance description
 *               scheduledDate:
 *                 type: string
 *                 format: date
 *                 description: Scheduled maintenance date
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 default: Medium
 *               assignedTo:
 *                 type: integer
 *                 description: User ID assigned to maintenance
 *               estimatedCost:
 *                 type: number
 *                 default: 0
 *               vendor:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   contact:
 *                     type: string
 *               notes:
 *                 type: string
 *               isRecurring:
 *                 type: boolean
 *                 default: false
 *               recurringInterval:
 *                 type: integer
 *                 description: Recurring interval in days
 *     responses:
 *       201:
 *         description: Maintenance scheduled successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/maintenance/schedule', protect, adminOnly, assetController.scheduleMaintenance.bind(assetController));

/**
 * @swagger
 * /api/assets/maintenance/list:
 *   get:
 *     summary: List maintenance schedules
 *     tags: [Asset Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: asset_id
 *         schema:
 *           type: integer
 *         description: Filter by asset ID
 *       - in: query
 *         name: maintenanceType
 *         schema:
 *           type: string
 *           enum: [Preventive, Corrective, Emergency, Routine, Inspection]
 *         description: Filter by maintenance type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Scheduled, In Progress, Completed, Cancelled, Overdue]
 *         description: Filter by maintenance status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         description: Filter by priority
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *         description: Filter by assigned user
 *     responses:
 *       200:
 *         description: Maintenance schedules retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/maintenance/list', protect, adminOnly, assetController.listMaintenanceSchedules.bind(assetController));

// ==================== WARRANTY ROUTES ====================

/**
 * @swagger
 * /api/assets/warranty/update/{id}:
 *   put:
 *     summary: Update warranty info
 *     tags: [Asset Warranty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Warranty start date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Warranty end date
 *               provider:
 *                 type: string
 *                 description: Warranty provider
 *               terms:
 *                 type: string
 *                 description: Warranty terms and conditions
 *     responses:
 *       200:
 *         description: Warranty information updated successfully
 *       404:
 *         description: Asset not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.put('/warranty/update/:id', protect, adminOnly, assetController.updateWarranty.bind(assetController));

// ==================== DEPRECIATION ROUTES ====================

/**
 * @swagger
 * /api/assets/depreciation/calculate:
 *   post:
 *     summary: Calculate asset depreciation
 *     tags: [Asset Depreciation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assetId
 *               - method
 *               - usefulLife
 *               - residualValue
 *             properties:
 *               assetId:
 *                 type: integer
 *                 description: Asset ID
 *               method:
 *                 type: string
 *                 enum: [Straight Line, Declining Balance, Sum of Years, Units of Production]
 *                 description: Depreciation method
 *               usefulLife:
 *                 type: number
 *                 description: Useful life in years
 *               residualValue:
 *                 type: number
 *                 description: Residual value
 *     responses:
 *       200:
 *         description: Depreciation calculated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/depreciation/calculate', protect, financeOnly, assetController.calculateDepreciation.bind(assetController));

// ==================== REPORT ROUTES ====================

/**
 * @swagger
 * /api/assets/report-lost:
 *   post:
 *     summary: Report lost/damaged asset
 *     tags: [Asset Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *               - reportType
 *               - description
 *             properties:
 *               asset_id:
 *                 type: integer
 *                 description: Asset ID
 *               reportType:
 *                 type: string
 *                 enum: [Lost, Damaged, Stolen, Found, Malfunction]
 *                 description: Type of report
 *               description:
 *                 type: string
 *                 description: Report description
 *               location:
 *                 type: string
 *                 description: Location where incident occurred
 *               severity:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 default: Medium
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Image URLs
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Asset report submitted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/report-lost', protect, adminOrEmployee, assetController.reportLostAsset.bind(assetController));

/**
 * @swagger
 * /api/assets/mark-disposed/{id}:
 *   put:
 *     summary: Mark asset as disposed
 *     tags: [Asset Disposal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - disposalType
 *               - disposalDate
 *               - disposalReason
 *               - approvedBy
 *             properties:
 *               disposalType:
 *                 type: string
 *                 enum: [Sale, Donation, Recycling, Destruction, Trade-in, Lost, Stolen]
 *                 description: Type of disposal
 *               disposalDate:
 *                 type: string
 *                 format: date
 *                 description: Disposal date
 *               disposalValue:
 *                 type: number
 *                 default: 0
 *                 description: Disposal value
 *               disposalReason:
 *                 type: string
 *                 description: Reason for disposal
 *               approvedBy:
 *                 type: integer
 *                 description: User ID who approved disposal
 *               buyer:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   contact:
 *                     type: string
 *                   address:
 *                     type: string
 *               disposalMethod:
 *                 type: string
 *                 description: Method of disposal
 *               disposalLocation:
 *                 type: string
 *                 description: Disposal location
 *               certificateNumber:
 *                 type: string
 *                 description: Disposal certificate number
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     path:
 *                       type: string
 *                     type:
 *                       type: string
 *     responses:
 *       200:
 *         description: Asset marked as disposed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.put('/mark-disposed/:id', protect, adminOnly, assetController.markDisposed.bind(assetController));

/**
 * @swagger
 * /api/assets/disposal/list:
 *   get:
 *     summary: View disposal records
 *     tags: [Asset Disposal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: disposalType
 *         schema:
 *           type: string
 *           enum: [Sale, Donation, Recycling, Destruction, Trade-in, Lost, Stolen]
 *         description: Filter by disposal type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Completed, Cancelled]
 *         description: Filter by disposal status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: Disposal records retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/disposal/list', protect, adminOnly, assetController.listDisposalRecords.bind(assetController));

// ==================== SCAN ROUTES ====================

/**
 * @swagger
 * /api/assets/scan/{code}:
 *   get:
 *     summary: Fetch asset details via QR/barcode
 *     tags: [Asset Scanning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: QR code, barcode, or asset code
 *     responses:
 *       200:
 *         description: Asset details retrieved successfully
 *       404:
 *         description: Asset not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/scan/:code', protect, allUsers, assetController.scanAsset.bind(assetController));

/**
 * @swagger
 * /api/assets/barcode/generate/{id}:
 *   get:
 *     summary: Generate QR/barcode for asset
 *     tags: [Asset Scanning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: Barcode generated successfully
 *       404:
 *         description: Asset not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/barcode/generate/:id', protect, adminOnly, assetController.generateBarcode.bind(assetController));

module.exports = router;
