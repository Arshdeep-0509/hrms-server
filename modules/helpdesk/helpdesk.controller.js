const helpdeskService = require('./helpdesk.service');

class HelpdeskController {
  /**
   * List all tickets
   * Accessible by: Super Admin / Client Admin / Support Staff / HR / Employee (own tickets)
   */
  async listTickets(req, res) {
    try {
      const tickets = await helpdeskService.listTickets(req.query, req.user);
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during ticket retrieval' });
    }
  }

  /**
   * Get ticket by ID
   * Accessible by: Super Admin / Client Admin / Support Staff / HR / Employee (own tickets)
   */
  async getTicket(req, res) {
    try {
      const ticket = await helpdeskService.getTicketById(req.params.ticket_id, req.user);
      res.json(ticket);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during ticket retrieval' });
    }
  }

  /**
   * Create new ticket
   * Accessible by: All authenticated users
   */
  async createTicket(req, res) {
    try {
      const result = await helpdeskService.createTicket(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating ticket:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during ticket creation' });
    }
  }

  /**
   * Update ticket details
   * Accessible by: Support Staff / HR / Employee (own tickets)
   */
  async updateTicket(req, res) {
    try {
      const result = await helpdeskService.updateTicket(req.params.ticket_id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error updating ticket:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during ticket update' });
    }
  }

  /**
   * Assign ticket to agent
   * Accessible by: Super Admin / Client Admin / Support Staff / HR
   */
  async assignTicket(req, res) {
    try {
      const result = await helpdeskService.assignTicket(req.params.ticket_id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error assigning ticket:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during ticket assignment' });
    }
  }

  /**
   * Update ticket status
   * Accessible by: Support Staff / HR / Assigned Agent
   */
  async updateTicketStatus(req, res) {
    try {
      const result = await helpdeskService.updateTicketStatus(req.params.ticket_id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during ticket status update' });
    }
  }

  /**
   * Escalate ticket
   * Accessible by: Support Staff / HR / Assigned Agent
   */
  async escalateTicket(req, res) {
    try {
      const result = await helpdeskService.escalateTicket(req.params.ticket_id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error escalating ticket:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during ticket escalation' });
    }
  }

  /**
   * Update ticket priority
   * Accessible by: Super Admin / Client Admin / Support Staff / HR
   */
  async updateTicketPriority(req, res) {
    try {
      const result = await helpdeskService.updateTicketPriority(req.params.ticket_id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error updating ticket priority:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during ticket priority update' });
    }
  }

  /**
   * Add comment to ticket
   * Accessible by: Support Staff / HR / Employee (own tickets) / Assigned Agent
   */
  async addComment(req, res) {
    try {
      const result = await helpdeskService.addComment(req.params.ticket_id, req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error adding comment:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during comment addition' });
    }
  }

  /**
   * Upload attachment to ticket
   * Accessible by: Support Staff / HR / Employee (own tickets) / Assigned Agent
   */
  async uploadAttachment(req, res) {
    try {
      const result = await helpdeskService.uploadAttachment(req.params.ticket_id, req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error uploading attachment:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during attachment upload' });
    }
  }

  /**
   * Delete ticket (soft delete)
   * Accessible by: Super Admin / Client Admin
   */
  async deleteTicket(req, res) {
    try {
      const result = await helpdeskService.deleteTicket(req.params.ticket_id, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during ticket deletion' });
    }
  }

  /**
   * Get ticket analytics/summary
   * Accessible by: Super Admin / Client Admin / Support Staff / HR
   */
  async getTicketAnalytics(req, res) {
    try {
      const analytics = await helpdeskService.getTicketAnalytics(req.query, req.user);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching ticket analytics:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during analytics retrieval' });
    }
  }

  /**
   * Get agent performance statistics
   * Accessible by: Super Admin / Client Admin
   */
  async getAgentPerformance(req, res) {
    try {
      const performance = await helpdeskService.getAgentPerformance(req.params.agent_id, req.query, req.user);
      res.json(performance);
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during performance retrieval' });
    }
  }

  /**
   * Get category-wise issue analysis
   * Accessible by: Super Admin / Client Admin / Support Staff / HR
   */
  async getCategoryAnalysis(req, res) {
    try {
      const analytics = await helpdeskService.getTicketAnalytics(req.query, req.user);
      res.json({
        categoryDistribution: analytics.categoryDistribution,
        summary: analytics.summary,
      });
    } catch (error) {
      console.error('Error fetching category analysis:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during category analysis' });
    }
  }
}

module.exports = new HelpdeskController();
