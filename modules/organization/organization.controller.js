const organizationService = require('./organization.service');

class OrganizationController {
  /**
   * List all client organizations
   * Accessible by: Super Admin, Client Manager, Client Admin
   */
  async listOrganizations(req, res) {
    try {
      const organizations = await organizationService.listOrganizations(req.user);
      
      if (req.user.role === 'Client Admin' && organizations.length === 0) {
        return res.status(200).json({ 
          message: 'No organization linked to your account.', 
          organizations: [] 
        });
      }

      res.json(organizations);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during organization retrieval' });
    }
  }

  /**
   * Create new client organization
   * Accessible by: Super Admin
   */
  async createOrganization(req, res) {
    try {
      const result = await organizationService.createOrganization(req.body);
      res.status(201).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during organization creation' });
    }
  }

  /**
   * Get organization details
   * Accessible by: Super Admin, Client Admin (if it's their organization)
   */
  async getOrganizationDetails(req, res) {
    try {
      const organization = await organizationService.getOrganizationDetails(req.params.id, req.user);
      res.json(organization);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Error fetching organization details' });
    }
  }

  /**
   * Update client info
   * Accessible by: Super Admin
   */
  async updateOrganization(req, res) {
    try {
      const result = await organizationService.updateOrganization(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during organization update' });
    }
  }

  /**
   * Delete organization
   * Accessible by: Super Admin
   */
  async deleteOrganization(req, res) {
    try {
      const result = await organizationService.deleteOrganization(req.params.id);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during organization deletion' });
    }
  }

  /**
   * Configure HR/payroll policies
   * Accessible by: Client Admin
   */
  async configurePolicies(req, res) {
    try {
      const { settings } = req.body;
      const result = await organizationService.configurePolicies(req.params.id, settings, req.user.id);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during policy configuration' });
    }
  }

  /**
   * Assign HR Account Manager
   * Accessible by: Super Admin
   */
  async assignAccountManager(req, res) {
    try {
      const { managerId } = req.body;
      const result = await organizationService.assignAccountManager(req.params.id, managerId);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during manager assignment' });
    }
  }
}

module.exports = new OrganizationController();

