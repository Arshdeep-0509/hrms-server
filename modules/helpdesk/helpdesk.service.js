const Ticket = require('./helpdesk.schema');
const Organization = require('../organization/organization.schema');
const User = require('../user/user.schema');
const Employee = require('../employee/employee.schema');
const Counter = require('../../models/counter.model');

class HelpdeskService {
  /**
   * List all tickets with filters
   * @param {Object} filters - Filter options (status, priority, category, assignedTo, etc.)
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Array>} Array of tickets
   */
  async listTickets(filters, user) {
    const query = { isDeleted: false };

    // If user is not Super Admin, filter by their organization
    if (user.role !== 'Super Admin') {
      const organization = await Organization.findOne({ clientAdmin: user.id });
      if (organization) {
        query.organization = organization._id;
      } else {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
    } else if (filters.organization) {
      query.organization = filters.organization;
    }

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.assignedTo) {
      query.assignedTo = filters.assignedTo;
    }

    if (filters.requester) {
      query.requester = filters.requester;
    }

    if (filters.slaStatus) {
      const now = new Date();
      switch (filters.slaStatus) {
        case 'overdue':
          query.slaDeadline = { $lt: now };
          query.status = { $nin: ['Resolved', 'Closed'] };
          break;
        case 'due_soon':
          const soon = new Date(now.getTime() + (24 * 60 * 60 * 1000));
          query.slaDeadline = { $lte: soon, $gte: now };
          query.status = { $nin: ['Resolved', 'Closed'] };
          break;
        case 'on_track':
          query.slaDeadline = { $gt: new Date(now.getTime() + (24 * 60 * 60 * 1000)) };
          query.status = { $nin: ['Resolved', 'Closed'] };
          break;
      }
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { ticket_id: { $regex: filters.search, $options: 'i' } },
        { requesterName: { $regex: filters.search, $options: 'i' } },
        { requesterEmail: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // Date range filters
    if (filters.dateFrom) {
      query.createdAt = { $gte: new Date(filters.dateFrom) };
    }

    if (filters.dateTo) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(filters.dateTo);
      } else {
        query.createdAt = { $lte: new Date(filters.dateTo) };
      }
    }

    const tickets = await Ticket.find(query)
      .populate('requester', 'name email')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('escalatedBy', 'name email')
      .populate('organization', 'name')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('comments.commentedBy', 'name email')
      .populate('attachments.uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    return tickets;
  }

  /**
   * Get ticket by ID
   * @param {String} ticketId - Ticket ID
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Ticket details
   */
  async getTicketById(ticketId, user) {
    // Try to find by ticket_id first (numeric), then fall back to ObjectId
    let ticket = await Ticket.findOne({ ticket_id: parseInt(ticketId) });
    if (!ticket) {
      ticket = await Ticket.findById(ticketId);
    }

    if (!ticket || ticket.isDeleted) {
      throw { statusCode: 404, message: 'Ticket not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin' && user.role !== 'Client Admin') {
      // Users can only access their own tickets or tickets assigned to them
      if (ticket.requester.toString() !== user.id && 
          (!ticket.assignedTo || ticket.assignedTo.toString() !== user.id)) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this ticket.' };
      }
    } else if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org || ticket.organization.toString() !== org._id.toString()) {
        throw { statusCode: 403, message: 'Forbidden: You do not have access to this ticket.' };
      }
    }

    await ticket.populate([
      { path: 'requester', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'assignedBy', select: 'name email' },
      { path: 'resolvedBy', select: 'name email' },
      { path: 'escalatedBy', select: 'name email' },
      { path: 'organization', select: 'name' },
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' },
      { path: 'comments.commentedBy', select: 'name email' },
      { path: 'attachments.uploadedBy', select: 'name email' },
    ]);

    return ticket;
  }

  /**
   * Create new ticket
   * @param {Object} ticketData - Ticket data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Created ticket
   */
  async createTicket(ticketData, user) {
    const {
      title,
      description,
      category,
      subcategory,
      priority,
      sla,
      tags,
      labels,
      source,
      impact,
      urgency,
    } = ticketData;

    // Get organization
    let organizationId;
    if (user.role !== 'Super Admin') {
      const org = await Organization.findOne({ clientAdmin: user.id });
      if (!org) {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
      organizationId = org._id;
    } else {
      const org = await Organization.findById(ticketData.organization);
      if (!org) {
        throw { statusCode: 404, message: 'Organization not found.' };
      }
      organizationId = org._id;
    }

    // Get requester information
    const requester = await User.findById(user.id);
    if (!requester) {
      throw { statusCode: 404, message: 'Requester not found.' };
    }

    // Get employee information for requester
    const employee = await Employee.findOne({ user: user.id });
    const requesterName = employee ? `${employee.firstName} ${employee.lastName}` : requester.name;
    const requesterDepartment = employee ? employee.department : 'Unknown';

    // Generate ticket ID
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'ticket_id' },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    const ticket_id = counter.sequence_value;

    // Set SLA based on priority
    let responseTime = 24;
    let resolutionTime = 72;
    
    if (priority === 'High') {
      responseTime = 4;
      resolutionTime = 24;
    } else if (priority === 'Critical') {
      responseTime = 1;
      resolutionTime = 4;
    }

    const ticket = await Ticket.create({
      ticket_id,
      title,
      description,
      category,
      subcategory,
      priority,
      sla: sla || 'Standard',
      responseTime,
      resolutionTime,
      requester: user.id,
      requester_id: user.user_id || user.id,
      requesterEmail: requester.email,
      requesterName,
      requesterDepartment,
      organization: organizationId,
      organization_id: ticketData.organization_id || 1,
      source: source || 'Web Portal',
      impact: impact || 'Medium',
      urgency: urgency || 'Medium',
      tags: tags || [],
      labels: labels || [],
      createdBy: user.id,
      createdBy_id: user.user_id || user.id,
      statusHistory: [{
        status: 'Open',
        changedAt: new Date(),
        changedBy: user.id,
        changedBy_id: user.user_id || user.id,
        reason: 'Ticket created',
      }],
    });

    await ticket.populate([
      { path: 'requester', select: 'name email' },
      { path: 'organization', select: 'name' },
      { path: 'createdBy', select: 'name email' },
    ]);

    return {
      message: 'Ticket created successfully',
      ticket,
    };
  }

  /**
   * Update ticket details
   * @param {String} ticketId - Ticket ID
   * @param {Object} updateData - Update data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated ticket
   */
  async updateTicket(ticketId, updateData, user) {
    // Try to find by ticket_id first (numeric), then fall back to ObjectId
    let ticket = await Ticket.findOne({ ticket_id: parseInt(ticketId) });
    if (!ticket) {
      ticket = await Ticket.findById(ticketId);
    }

    if (!ticket || ticket.isDeleted) {
      throw { statusCode: 404, message: 'Ticket not found.' };
    }

    // Authorization check - Only support staff or ticket requester can update
    if (user.role !== 'Super Admin' && user.role !== 'Client Admin' && 
        user.role !== 'Support Staff' && user.role !== 'HR Account Manager') {
      if (ticket.requester.toString() !== user.id) {
        throw { statusCode: 403, message: 'Forbidden: You do not have permission to update this ticket.' };
      }
    }

    // Update allowed fields
    const allowedFields = [
      'title',
      'description',
      'category',
      'subcategory',
      'tags',
      'labels',
      'impact',
      'urgency',
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        ticket[field] = updateData[field];
      }
    });

    ticket.updatedBy = user.id;
    ticket.updatedBy_id = user.user_id || user.id;
    await ticket.save();

    await ticket.populate([
      { path: 'requester', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'organization', select: 'name' },
      { path: 'updatedBy', select: 'name email' },
    ]);

    return {
      message: 'Ticket updated successfully',
      ticket,
    };
  }

  /**
   * Assign ticket to agent
   * @param {String} ticketId - Ticket ID
   * @param {Object} assignmentData - Assignment data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated ticket
   */
  async assignTicket(ticketId, assignmentData, user) {
    // Try to find by ticket_id first (numeric), then fall back to ObjectId
    let ticket = await Ticket.findOne({ ticket_id: parseInt(ticketId) });
    if (!ticket) {
      ticket = await Ticket.findById(ticketId);
    }

    if (!ticket || ticket.isDeleted) {
      throw { statusCode: 404, message: 'Ticket not found.' };
    }

    // Authorization check - Only support staff and admins can assign
    if (!['Super Admin', 'Client Admin', 'Support Staff', 'HR Account Manager'].includes(user.role)) {
      throw { statusCode: 403, message: 'Forbidden: You do not have permission to assign tickets.' };
    }

    const { assignedTo, reason } = assignmentData;

    // Verify assigned user exists
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      throw { statusCode: 404, message: 'Assigned user not found.' };
    }

    // Update assignment
    const previousAssignee = ticket.assignedTo;
    ticket.assignedTo = assignedTo;
    ticket.assignedTo_id = assignedUser.user_id || assignedUser._id;
    ticket.assignedBy = user.id;
    ticket.assignedBy_id = user.user_id || user.id;
    ticket.assignedAt = new Date();

    // Add to assignment history
    ticket.assignmentHistory.push({
      assignedTo,
      assignedTo_id: assignedUser.user_id || assignedUser._id,
      assignedBy: user.id,
      assignedBy_id: user.user_id || user.id,
      reason: reason || 'Ticket assigned',
    });

    // Update status if not already in progress
    if (ticket.status === 'Open') {
      ticket.status = 'Pending';
      ticket.statusHistory.push({
        status: 'Pending',
        changedAt: new Date(),
        changedBy: user.id,
        changedBy_id: user.user_id || user.id,
        reason: 'Ticket assigned to agent',
      });
    }

    ticket.updatedBy = user.id;
    ticket.updatedBy_id = user.user_id || user.id;
    await ticket.save();

    await ticket.populate([
      { path: 'requester', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'assignedBy', select: 'name email' },
      { path: 'organization', select: 'name' },
    ]);

    return {
      message: 'Ticket assigned successfully',
      ticket,
    };
  }

  /**
   * Update ticket status
   * @param {String} ticketId - Ticket ID
   * @param {Object} statusData - Status update data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated ticket
   */
  async updateTicketStatus(ticketId, statusData, user) {
    // Try to find by ticket_id first (numeric), then fall back to ObjectId
    let ticket = await Ticket.findOne({ ticket_id: parseInt(ticketId) });
    if (!ticket) {
      ticket = await Ticket.findById(ticketId);
    }

    if (!ticket || ticket.isDeleted) {
      throw { statusCode: 404, message: 'Ticket not found.' };
    }

    // Authorization check
    if (!['Super Admin', 'Client Admin', 'Support Staff', 'HR Account Manager'].includes(user.role) &&
        ticket.assignedTo && ticket.assignedTo.toString() !== user.id) {
      throw { statusCode: 403, message: 'Forbidden: You do not have permission to update this ticket status.' };
    }

    const { status, reason, notes } = statusData;

    // Update status
    const previousStatus = ticket.status;
    ticket.status = status;

    // Add to status history
    ticket.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: user.id,
      changedBy_id: user.user_id || user.id,
      reason: reason || `Status changed from ${previousStatus} to ${status}`,
      notes,
    });

    // Set resolution details if resolved
    if (status === 'Resolved') {
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = user.id;
      ticket.resolvedBy_id = user.user_id || user.id;
    }

    ticket.updatedBy = user.id;
    ticket.updatedBy_id = user.user_id || user.id;
    await ticket.save();

    await ticket.populate([
      { path: 'requester', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'resolvedBy', select: 'name email' },
      { path: 'organization', select: 'name' },
    ]);

    return {
      message: 'Ticket status updated successfully',
      ticket,
    };
  }

  /**
   * Escalate ticket
   * @param {String} ticketId - Ticket ID
   * @param {Object} escalationData - Escalation data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated ticket
   */
  async escalateTicket(ticketId, escalationData, user) {
    // Try to find by ticket_id first (numeric), then fall back to ObjectId
    let ticket = await Ticket.findOne({ ticket_id: parseInt(ticketId) });
    if (!ticket) {
      ticket = await Ticket.findById(ticketId);
    }

    if (!ticket || ticket.isDeleted) {
      throw { statusCode: 404, message: 'Ticket not found.' };
    }

    // Authorization check
    if (!['Super Admin', 'Client Admin', 'Support Staff', 'HR Account Manager'].includes(user.role) &&
        ticket.assignedTo && ticket.assignedTo.toString() !== user.id) {
      throw { statusCode: 403, message: 'Forbidden: You do not have permission to escalate this ticket.' };
    }

    const { reason, newPriority, newAssignee } = escalationData;

    // Update escalation details
    ticket.escalatedAt = new Date();
    ticket.escalatedBy = user.id;
    ticket.escalatedBy_id = user.user_id || user.id;
    ticket.escalationReason = reason;
    ticket.escalationLevel = (ticket.escalationLevel || 0) + 1;

    // Update priority if provided
    if (newPriority) {
      const previousPriority = ticket.priority;
      ticket.priority = newPriority;
      ticket.priorityHistory.push({
        priority: newPriority,
        changedAt: new Date(),
        changedBy: user.id,
        changedBy_id: user.user_id || user.id,
        reason: `Escalated from ${previousPriority} to ${newPriority}`,
      });
    }

    // Update assignee if provided
    if (newAssignee) {
      const assignedUser = await User.findById(newAssignee);
      if (assignedUser) {
        ticket.assignedTo = newAssignee;
        ticket.assignedTo_id = assignedUser.user_id || assignedUser._id;
        ticket.assignedBy = user.id;
        ticket.assignedBy_id = user.user_id || user.id;
        ticket.assignedAt = new Date();
      }
    }

    // Update status
    ticket.status = 'Escalated';
    ticket.statusHistory.push({
      status: 'Escalated',
      changedAt: new Date(),
      changedBy: user.id,
      changedBy_id: user.user_id || user.id,
      reason: reason || 'Ticket escalated',
    });

    ticket.updatedBy = user.id;
    ticket.updatedBy_id = user.user_id || user.id;
    await ticket.save();

    await ticket.populate([
      { path: 'requester', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'escalatedBy', select: 'name email' },
      { path: 'organization', select: 'name' },
    ]);

    return {
      message: 'Ticket escalated successfully',
      ticket,
    };
  }

  /**
   * Update ticket priority
   * @param {String} ticketId - Ticket ID
   * @param {Object} priorityData - Priority update data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated ticket
   */
  async updateTicketPriority(ticketId, priorityData, user) {
    // Try to find by ticket_id first (numeric), then fall back to ObjectId
    let ticket = await Ticket.findOne({ ticket_id: parseInt(ticketId) });
    if (!ticket) {
      ticket = await Ticket.findById(ticketId);
    }

    if (!ticket || ticket.isDeleted) {
      throw { statusCode: 404, message: 'Ticket not found.' };
    }

    // Authorization check
    if (!['Super Admin', 'Client Admin', 'Support Staff', 'HR Account Manager'].includes(user.role)) {
      throw { statusCode: 403, message: 'Forbidden: You do not have permission to update ticket priority.' };
    }

    const { priority, reason } = priorityData;

    // Update priority
    const previousPriority = ticket.priority;
    ticket.priority = priority;

    // Add to priority history
    ticket.priorityHistory.push({
      priority,
      changedAt: new Date(),
      changedBy: user.id,
      changedBy_id: user.user_id || user.id,
      reason: reason || `Priority changed from ${previousPriority} to ${priority}`,
    });

    // Update SLA based on new priority
    let responseTime = 24;
    let resolutionTime = 72;
    
    if (priority === 'High') {
      responseTime = 4;
      resolutionTime = 24;
    } else if (priority === 'Critical') {
      responseTime = 1;
      resolutionTime = 4;
    }

    ticket.responseTime = responseTime;
    ticket.resolutionTime = resolutionTime;

    // Update SLA deadline
    const now = new Date();
    ticket.slaDeadline = new Date(now.getTime() + (resolutionTime * 60 * 60 * 1000));

    ticket.updatedBy = user.id;
    ticket.updatedBy_id = user.user_id || user.id;
    await ticket.save();

    await ticket.populate([
      { path: 'requester', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'organization', select: 'name' },
    ]);

    return {
      message: 'Ticket priority updated successfully',
      ticket,
    };
  }

  /**
   * Add comment to ticket
   * @param {String} ticketId - Ticket ID
   * @param {Object} commentData - Comment data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated ticket
   */
  async addComment(ticketId, commentData, user) {
    // Try to find by ticket_id first (numeric), then fall back to ObjectId
    let ticket = await Ticket.findOne({ ticket_id: parseInt(ticketId) });
    if (!ticket) {
      ticket = await Ticket.findById(ticketId);
    }

    if (!ticket || ticket.isDeleted) {
      throw { statusCode: 404, message: 'Ticket not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin' && user.role !== 'Client Admin' && 
        user.role !== 'Support Staff' && user.role !== 'HR Account Manager') {
      if (ticket.requester.toString() !== user.id && 
          (!ticket.assignedTo || ticket.assignedTo.toString() !== user.id)) {
        throw { statusCode: 403, message: 'Forbidden: You do not have permission to comment on this ticket.' };
      }
    }

    const { comment, isInternal } = commentData;

    // Get user name
    const commenter = await User.findById(user.id);
    const employee = await Employee.findOne({ user: user.id });
    const commenterName = employee ? `${employee.firstName} ${employee.lastName}` : commenter.name;

    // Add comment
    ticket.comments.push({
      comment,
      isInternal: isInternal || false,
      commentedBy: user.id,
      commentedBy_id: user.user_id || user.id,
      commentedByName: commenterName,
    });

    ticket.updatedBy = user.id;
    ticket.updatedBy_id = user.user_id || user.id;
    await ticket.save();

    await ticket.populate([
      { path: 'requester', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'comments.commentedBy', select: 'name email' },
      { path: 'organization', select: 'name' },
    ]);

    return {
      message: 'Comment added successfully',
      ticket,
    };
  }

  /**
   * Upload attachment to ticket
   * @param {String} ticketId - Ticket ID
   * @param {Object} attachmentData - Attachment data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Updated ticket
   */
  async uploadAttachment(ticketId, attachmentData, user) {
    // Try to find by ticket_id first (numeric), then fall back to ObjectId
    let ticket = await Ticket.findOne({ ticket_id: parseInt(ticketId) });
    if (!ticket) {
      ticket = await Ticket.findById(ticketId);
    }

    if (!ticket || ticket.isDeleted) {
      throw { statusCode: 404, message: 'Ticket not found.' };
    }

    // Authorization check
    if (user.role !== 'Super Admin' && user.role !== 'Client Admin' && 
        user.role !== 'Support Staff' && user.role !== 'HR Account Manager') {
      if (ticket.requester.toString() !== user.id && 
          (!ticket.assignedTo || ticket.assignedTo.toString() !== user.id)) {
        throw { statusCode: 403, message: 'Forbidden: You do not have permission to upload attachments to this ticket.' };
      }
    }

    const { fileName, originalName, filePath, fileSize, mimeType, isPublic } = attachmentData;

    // Add attachment
    ticket.attachments.push({
      fileName,
      originalName,
      filePath,
      fileSize,
      mimeType,
      uploadedBy: user.id,
      uploadedBy_id: user.user_id || user.id,
      isPublic: isPublic !== false,
    });

    ticket.updatedBy = user.id;
    ticket.updatedBy_id = user.user_id || user.id;
    await ticket.save();

    await ticket.populate([
      { path: 'requester', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'attachments.uploadedBy', select: 'name email' },
      { path: 'organization', select: 'name' },
    ]);

    return {
      message: 'Attachment uploaded successfully',
      ticket,
    };
  }

  /**
   * Soft delete ticket
   * @param {String} ticketId - Ticket ID
   * @param {Object} deleteData - Delete data
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Success message
   */
  async deleteTicket(ticketId, deleteData, user) {
    // Try to find by ticket_id first (numeric), then fall back to ObjectId
    let ticket = await Ticket.findOne({ ticket_id: parseInt(ticketId) });
    if (!ticket) {
      ticket = await Ticket.findById(ticketId);
    }

    if (!ticket || ticket.isDeleted) {
      throw { statusCode: 404, message: 'Ticket not found.' };
    }

    // Authorization check - Only admins can delete
    if (!['Super Admin', 'Client Admin'].includes(user.role)) {
      throw { statusCode: 403, message: 'Forbidden: You do not have permission to delete tickets.' };
    }

    const { reason } = deleteData;

    // Soft delete
    ticket.isDeleted = true;
    ticket.deletedAt = new Date();
    ticket.deletedBy = user.id;
    ticket.deletedBy_id = user.user_id || user.id;
    ticket.deleteReason = reason || 'Ticket deleted';

    await ticket.save();

    return {
      message: 'Ticket deleted successfully',
    };
  }

  /**
   * Get ticket analytics/summary
   * @param {Object} filters - Filter options
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Analytics data
   */
  async getTicketAnalytics(filters, user) {
    const query = { isDeleted: false };

    // If user is not Super Admin, filter by their organization
    if (user.role !== 'Super Admin') {
      const organization = await Organization.findOne({ clientAdmin: user.id });
      if (organization) {
        query.organization = organization._id;
      } else {
        throw { statusCode: 403, message: 'No organization found for your account.' };
      }
    } else if (filters.organization) {
      query.organization = filters.organization;
    }

    // Date range filters
    if (filters.dateFrom) {
      query.createdAt = { $gte: new Date(filters.dateFrom) };
    }

    if (filters.dateTo) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(filters.dateTo);
      } else {
        query.createdAt = { $lte: new Date(filters.dateTo) };
      }
    }

    const tickets = await Ticket.find(query);

    // Calculate analytics
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => ['Open', 'Pending', 'In Progress'].includes(t.status)).length;
    const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
    const closedTickets = tickets.filter(t => t.status === 'Closed').length;
    const escalatedTickets = tickets.filter(t => t.status === 'Escalated').length;

    // Status distribution
    const statusDistribution = {
      Open: tickets.filter(t => t.status === 'Open').length,
      Pending: tickets.filter(t => t.status === 'Pending').length,
      'In Progress': tickets.filter(t => t.status === 'In Progress').length,
      Resolved: resolvedTickets,
      Closed: closedTickets,
      Escalated: escalatedTickets,
    };

    // Priority distribution
    const priorityDistribution = {
      Low: tickets.filter(t => t.priority === 'Low').length,
      Medium: tickets.filter(t => t.priority === 'Medium').length,
      High: tickets.filter(t => t.priority === 'High').length,
      Critical: tickets.filter(t => t.priority === 'Critical').length,
    };

    // Category distribution
    const categoryDistribution = tickets.reduce((acc, ticket) => {
      acc[ticket.category] = (acc[ticket.category] || 0) + 1;
      return acc;
    }, {});

    // SLA performance
    const now = new Date();
    const overdueTickets = tickets.filter(t => 
      t.slaDeadline && t.slaDeadline < now && !['Resolved', 'Closed'].includes(t.status)
    ).length;

    const onTimeTickets = tickets.filter(t => 
      t.slaDeadline && t.slaDeadline >= now && !['Resolved', 'Closed'].includes(t.status)
    ).length;

    const slaPerformance = {
      overdue: overdueTickets,
      onTime: onTimeTickets,
      total: overdueTickets + onTimeTickets,
      percentage: totalTickets > 0 ? ((onTimeTickets / (overdueTickets + onTimeTickets)) * 100).toFixed(2) : 0,
    };

    // Average resolution time
    const resolvedTicketsWithTime = tickets.filter(t => t.status === 'Resolved' && t.resolvedAt);
    const avgResolutionTime = resolvedTicketsWithTime.length > 0 
      ? resolvedTicketsWithTime.reduce((sum, t) => {
          const resolutionTime = (t.resolvedAt - t.createdAt) / (1000 * 60 * 60); // hours
          return sum + resolutionTime;
        }, 0) / resolvedTicketsWithTime.length
      : 0;

    return {
      summary: {
        totalTickets,
        openTickets,
        resolvedTickets,
        closedTickets,
        escalatedTickets,
      },
      statusDistribution,
      priorityDistribution,
      categoryDistribution,
      slaPerformance,
      avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
    };
  }

  /**
   * Get agent performance statistics
   * @param {String} agentId - Agent ID
   * @param {Object} filters - Filter options
   * @param {Object} user - Current authenticated user
   * @returns {Promise<Object>} Agent performance data
   */
  async getAgentPerformance(agentId, filters, user) {
    // Authorization check
    if (user.role !== 'Super Admin' && user.role !== 'Client Admin') {
      throw { statusCode: 403, message: 'Forbidden: You do not have permission to view agent performance.' };
    }

    const query = { 
      isDeleted: false,
      assignedTo: agentId,
    };

    // Date range filters
    if (filters.dateFrom) {
      query.createdAt = { $gte: new Date(filters.dateFrom) };
    }

    if (filters.dateTo) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(filters.dateTo);
      } else {
        query.createdAt = { $lte: new Date(filters.dateTo) };
      }
    }

    const tickets = await Ticket.find(query);

    // Calculate performance metrics
    const totalAssigned = tickets.length;
    const resolved = tickets.filter(t => t.status === 'Resolved').length;
    const closed = tickets.filter(t => t.status === 'Closed').length;
    const inProgress = tickets.filter(t => ['Open', 'Pending', 'In Progress'].includes(t.status)).length;

    // Average resolution time
    const resolvedTicketsWithTime = tickets.filter(t => t.status === 'Resolved' && t.resolvedAt);
    const avgResolutionTime = resolvedTicketsWithTime.length > 0 
      ? resolvedTicketsWithTime.reduce((sum, t) => {
          const resolutionTime = (t.resolvedAt - t.createdAt) / (1000 * 60 * 60); // hours
          return sum + resolutionTime;
        }, 0) / resolvedTicketsWithTime.length
      : 0;

    // SLA performance
    const now = new Date();
    const overdueTickets = tickets.filter(t => 
      t.slaDeadline && t.slaDeadline < now && !['Resolved', 'Closed'].includes(t.status)
    ).length;

    const onTimeTickets = tickets.filter(t => 
      t.slaDeadline && t.slaDeadline >= now && !['Resolved', 'Closed'].includes(t.status)
    ).length;

    const slaPerformance = {
      overdue: overdueTickets,
      onTime: onTimeTickets,
      total: overdueTickets + onTimeTickets,
      percentage: (overdueTickets + onTimeTickets) > 0 ? ((onTimeTickets / (overdueTickets + onTimeTickets)) * 100).toFixed(2) : 0,
    };

    return {
      agentId,
      totalAssigned,
      resolved,
      closed,
      inProgress,
      resolutionRate: totalAssigned > 0 ? ((resolved + closed) / totalAssigned * 100).toFixed(2) : 0,
      avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
      slaPerformance,
    };
  }
}

module.exports = new HelpdeskService();
