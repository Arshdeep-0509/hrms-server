const express = require('express');
const { protect, authorize } = require('../../middleware/authMiddleware');
const helpdeskController = require('./helpdesk.controller');

const router = express.Router();

// Define Role-Based Authorizations
const superAdminOrClientAdmin = authorize(['Super Admin', 'Client Admin']);
const supportStaffOrAdmin = authorize(['Super Admin', 'Client Admin', 'Support Staff', 'HR Account Manager']);
const allAuthenticated = authorize(['Super Admin', 'Client Admin', 'Support Staff', 'HR Account Manager', 'Employee']);

// Basic Ticket Management Routes

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: List all tickets with filters
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, Pending, In Progress, Resolved, Closed, Escalated]
 *         description: Filter by ticket status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         description: Filter by ticket priority
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [HR, IT, Payroll, Finance, General, Technical, Account, Other]
 *         description: Filter by ticket category
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned agent
 *       - in: query
 *         name: requester
 *         schema:
 *           type: string
 *         description: Filter by ticket requester
 *       - in: query
 *         name: slaStatus
 *         schema:
 *           type: string
 *           enum: [overdue, due_soon, on_track]
 *         description: Filter by SLA status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, or ticket ID
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 *         content:
 *           application/json:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Ticket'
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
router.get('/', protect, allAuthenticated, helpdeskController.listTickets.bind(helpdeskController));

/**
 * @swagger
 * /api/tickets/create:
 *   post:
 *     summary: Create a new support ticket
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: Ticket title
 *               description:
 *                 type: string
 *                 description: Detailed description of the issue
 *               category:
 *                 type: string
 *                 enum: [HR, IT, Payroll, Finance, General, Technical, Account, Other]
 *                 description: Ticket category
 *               subcategory:
 *                 type: string
 *                 description: Ticket subcategory
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 default: Medium
 *                 description: Ticket priority
 *               sla:
 *                 type: string
 *                 enum: [Standard, High Priority, Critical]
 *                 default: Standard
 *                 description: SLA level
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Ticket tags
 *               labels:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Ticket labels
 *               source:
 *                 type: string
 *                 enum: [Web Portal, Email, Phone, Walk-in, API, Other]
 *                 default: Web Portal
 *                 description: Ticket source
 *               impact:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 default: Medium
 *                 description: Business impact
 *               urgency:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 default: Medium
 *                 description: Urgency level
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Bad request
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
router.post('/create', protect, allAuthenticated, helpdeskController.createTicket.bind(helpdeskController));

/**
 * @swagger
 * /api/tickets/list:
 *   get:
 *     summary: View tickets (own or department-wise)
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, Pending, In Progress, Resolved, Closed, Escalated]
 *         description: Filter by ticket status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         description: Filter by ticket priority
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [HR, IT, Payroll, Finance, General, Technical, Account, Other]
 *         description: Filter by ticket category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, or ticket ID
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 *         content:
 *           application/json:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Ticket'
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
router.get('/list', protect, allAuthenticated, helpdeskController.listTickets.bind(helpdeskController));

/**
 * @swagger
 * /api/tickets/{ticket_id}:
 *   get:
 *     summary: Get ticket details
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticket_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
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
router.get('/:ticket_id', protect, allAuthenticated, helpdeskController.getTicket.bind(helpdeskController));

/**
 * @swagger
 * /api/tickets/update/{ticket_id}:
 *   put:
 *     summary: Update ticket details
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticket_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Ticket title
 *               description:
 *                 type: string
 *                 description: Detailed description of the issue
 *               category:
 *                 type: string
 *                 enum: [HR, IT, Payroll, Finance, General, Technical, Account, Other]
 *                 description: Ticket category
 *               subcategory:
 *                 type: string
 *                 description: Ticket subcategory
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Ticket tags
 *               labels:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Ticket labels
 *               impact:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 description: Business impact
 *               urgency:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 description: Urgency level
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
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
router.put('/update/:ticket_id', protect, allAuthenticated, helpdeskController.updateTicket.bind(helpdeskController));

/**
 * @swagger
 * /api/tickets/delete/{ticket_id}:
 *   delete:
 *     summary: Remove (soft-delete) ticket
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticket_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for deletion
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Ticket not found
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
router.delete('/delete/:ticket_id', protect, superAdminOrClientAdmin, helpdeskController.deleteTicket.bind(helpdeskController));

// Ticket Workflow & Escalation Routes

/**
 * @swagger
 * /api/tickets/assign/{ticket_id}:
 *   put:
 *     summary: Assign ticket to agent
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticket_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignedTo
 *             properties:
 *               assignedTo:
 *                 type: string
 *                 description: User ID of the agent to assign to
 *               reason:
 *                 type: string
 *                 description: Reason for assignment
 *     responses:
 *       200:
 *         description: Ticket assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
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
router.put('/assign/:ticket_id', protect, supportStaffOrAdmin, helpdeskController.assignTicket.bind(helpdeskController));

/**
 * @swagger
 * /api/tickets/status/{ticket_id}:
 *   put:
 *     summary: Update ticket status (Open, Pending, Resolved)
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticket_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
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
 *                 enum: [Open, Pending, In Progress, Resolved, Closed, Escalated]
 *                 description: New ticket status
 *               reason:
 *                 type: string
 *                 description: Reason for status change
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: Ticket status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
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
router.put('/status/:ticket_id', protect, supportStaffOrAdmin, helpdeskController.updateTicketStatus.bind(helpdeskController));

/**
 * @swagger
 * /api/tickets/escalate/{ticket_id}:
 *   put:
 *     summary: Escalate to higher level
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticket_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for escalation
 *               newPriority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 description: New priority level
 *               newAssignee:
 *                 type: string
 *                 description: New assignee user ID
 *     responses:
 *       200:
 *         description: Ticket escalated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
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
router.put('/escalate/:ticket_id', protect, supportStaffOrAdmin, helpdeskController.escalateTicket.bind(helpdeskController));

/**
 * @swagger
 * /api/tickets/priority/update/{ticket_id}:
 *   put:
 *     summary: Change priority or SLA
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticket_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - priority
 *             properties:
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 description: New priority level
 *               reason:
 *                 type: string
 *                 description: Reason for priority change
 *     responses:
 *       200:
 *         description: Ticket priority updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
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
router.put('/priority/update/:ticket_id', protect, supportStaffOrAdmin, helpdeskController.updateTicketPriority.bind(helpdeskController));

/**
 * @swagger
 * /api/tickets/comments/add:
 *   post:
 *     summary: Add internal comment or note
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticket_id
 *               - comment
 *             properties:
 *               ticket_id:
 *                 type: string
 *                 description: Ticket ID
 *               comment:
 *                 type: string
 *                 description: Comment text
 *               isInternal:
 *                 type: boolean
 *                 default: false
 *                 description: Whether comment is internal only
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
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
router.post('/comments/add', protect, allAuthenticated, helpdeskController.addComment.bind(helpdeskController));

/**
 * @swagger
 * /api/tickets/attachments/upload:
 *   post:
 *     summary: Upload file to ticket
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - ticket_id
 *               - file
 *             properties:
 *               ticket_id:
 *                 type: string
 *                 description: Ticket ID
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *                 description: Whether file is public
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
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
router.post('/attachments/upload', protect, allAuthenticated, helpdeskController.uploadAttachment.bind(helpdeskController));

// Ticket Analytics Routes

/**
 * @swagger
 * /api/tickets/reports/summary:
 *   get:
 *     summary: Ticket volume & status report
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *       - in: query
 *         name: organization
 *         schema:
 *           type: string
 *         description: Filter by organization
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalTickets:
 *                       type: number
 *                     openTickets:
 *                       type: number
 *                     resolvedTickets:
 *                       type: number
 *                     closedTickets:
 *                       type: number
 *                     escalatedTickets:
 *                       type: number
 *                 statusDistribution:
 *                   type: object
 *                 priorityDistribution:
 *                   type: object
 *                 categoryDistribution:
 *                   type: object
 *                 slaPerformance:
 *                   type: object
 *                 avgResolutionTime:
 *                   type: number
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
router.get('/reports/summary', protect, supportStaffOrAdmin, helpdeskController.getTicketAnalytics.bind(helpdeskController));

/**
 * @swagger
 * /api/tickets/reports/agent/{agent_id}:
 *   get:
 *     summary: Agent performance stats
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agent_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: Agent performance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agentId:
 *                   type: string
 *                 totalAssigned:
 *                   type: number
 *                 resolved:
 *                   type: number
 *                 closed:
 *                   type: number
 *                 inProgress:
 *                   type: number
 *                 resolutionRate:
 *                   type: number
 *                 avgResolutionTime:
 *                   type: number
 *                 slaPerformance:
 *                   type: object
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
router.get('/reports/agent/:agent_id', protect, superAdminOrClientAdmin, helpdeskController.getAgentPerformance.bind(helpdeskController));

/**
 * @swagger
 * /api/tickets/reports/category:
 *   get:
 *     summary: Category-wise issue analysis
 *     tags: [Helpdesk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *       - in: query
 *         name: organization
 *         schema:
 *           type: string
 *         description: Filter by organization
 *     responses:
 *       200:
 *         description: Category analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categoryDistribution:
 *                   type: object
 *                 summary:
 *                   type: object
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
router.get('/reports/category', protect, supportStaffOrAdmin, helpdeskController.getCategoryAnalysis.bind(helpdeskController));

module.exports = router;
