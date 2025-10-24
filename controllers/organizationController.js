// controllers/organizationController.js
const Organization = require('../models/Organization');
const User = require('../models/User'); // Needed to check roles and update

// Helper to check for allowed roles (for API 1)
const isAllowedToView = (role) => {
    return ['Super Admin', 'Client Manager', 'Client Admin'].includes(role);
};


// 1. List all client organizations (GET /api/organizations)
// Accessible by: Super Admin, Client Manager, Client Admin (optional filtering)
exports.listOrganizations = async (req, res) => {
    // Check if the user is a 'Client Admin' to potentially filter results
    if (req.user.role === 'Client Admin') {
        try {
            // A Client Admin should only see their own organization
            const organization = await Organization.findOne({ clientAdmin: req.user.id })
                .populate('clientAdmin', 'name email')
                .populate('hrAccountManager', 'name email');

            if (organization) {
                return res.json([organization]); // Return as an array for consistency
            } else {
                 // If the Client Admin is not linked to any organization yet
                 return res.status(200).json({ message: 'No organization linked to your account.', organizations: [] });
            }
        } catch (error) {
            console.error('Error fetching organizations for Client Admin:', error);
            return res.status(500).json({ message: 'Server error during organization retrieval' });
        }
    }

    // Default: Super Admin or Client Manager sees all organizations
    try {
        const organizations = await Organization.find({})
            .populate('clientAdmin', 'name email')
            .populate('hrAccountManager', 'name email');
        res.json(organizations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching organizations', error });
    }
};

// 2. Create new client organization (POST /api/organizations)
// Accessible by: Super Admin
exports.createOrganization = async (req, res) => {
    const { name, address, subscriptionPlan } = req.body;
    try {
        const organization = await Organization.create({
            name,
            address,
            subscriptionPlan
        });
        res.status(201).json({ message: 'Organization created successfully', organization });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'An organization with this name already exists.' });
        }
        res.status(500).json({ message: 'Server error during organization creation', error });
    }
};

// 3. Get organization details (GET /api/organizations/:id)
// Accessible by: Super Admin, Client Admin (if it's their organization)
exports.getOrganizationDetails = async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id)
            .populate('clientAdmin', 'name email')
            .populate('hrAccountManager', 'name email');

        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Authorization check for Client Admin: must be their organization
        if (req.user.role === 'Client Admin' && organization.clientAdmin?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You do not manage this organization.' });
        }

        res.json(organization);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching organization details', error });
    }
};

// 4. Update client info (PUT /api/organizations/:id)
// Accessible by: Super Admin
exports.updateOrganization = async (req, res) => {
    try {
        const organization = await Organization.findByIdAndUpdate(
            req.params.id,
            { 
                // Only update fields explicitly passed in the body
                $set: { 
                    name: req.body.name,
                    address: req.body.address,
                    subscriptionPlan: req.body.subscriptionPlan 
                } 
            },
            { new: true, runValidators: true }
        );

        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        res.json({ message: 'Organization updated successfully', organization });
    } catch (error) {
        res.status(500).json({ message: 'Server error during organization update', error });
    }
};

// 5. Delete organization (DELETE /api/organizations/:id)
// Accessible by: Super Admin
exports.deleteOrganization = async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        await Organization.deleteOne({ _id: req.params.id });

        res.json({ message: 'Organization deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during organization deletion', error });
    }
};

// 6. Configure HR/payroll policies (PUT /api/organizations/:id/settings)
// Accessible by: Client Admin
exports.configurePolicies = async (req, res) => {
    const { settings } = req.body;
    try {
        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Authorization check: Must be the Client Admin for this organization
        if (organization.clientAdmin?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You must be the assigned Client Admin to configure policies.' });
        }
        
        // Merge existing settings with new settings
        organization.settings = { ...organization.settings, ...settings };
        await organization.save();

        res.json({ message: 'Organization policies configured successfully', settings: organization.settings });
    } catch (error) {
        res.status(500).json({ message: 'Server error during policy configuration', error });
    }
};

// 7. Assign HR Account Manager (POST /api/organizations/:id/assign-account-manager)
// Accessible by: Super Admin
exports.assignAccountManager = async (req, res) => {
    const { managerId } = req.body;

    if (!managerId) {
        return res.status(400).json({ message: 'Manager ID is required.' });
    }

    try {
        // 1. Validate if the user being assigned is actually an 'HR Account Manager'
        const manager = await User.findById(managerId);
        if (!manager || manager.role !== 'HR Account Manager') {
            return res.status(400).json({ message: 'Invalid or unauthorized user ID provided. Must be an HR Account Manager.' });
        }

        // 2. Assign the manager to the organization
        const organization = await Organization.findByIdAndUpdate(
            req.params.id,
            { hrAccountManager: managerId },
            { new: true }
        );

        if (!organization) {
            return res.status(404).json({ message: 'Organization not found.' });
        }

        res.json({ 
            message: 'HR Account Manager assigned successfully', 
            organization: organization.name,
            manager: manager.name
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during manager assignment', error });
    }
};