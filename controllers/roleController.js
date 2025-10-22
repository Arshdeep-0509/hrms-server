const User = require('../models/User');
const Role = require('../models/Role');

// --- 1. Fetch all roles & permissions (Accessible to Super Admin) ---
exports.getAllRolesAndPermissions = async (req, res) => {
  try {
    const roles = await Role.find({});
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles', error });
  }
};

// --- 2. UPDATE Roles of a user (Accessible to Super Admin, Client Admin) ---
// This function updates the role in the User schema AND ensures the new role
// is correctly reflected in the Role schema with associated permissions using upsert.
exports.updateUserRole = async (req, res) => {
  const { userId, roleName } = req.body;

  if (!userId || !roleName) {
    return res.status(400).json({ message: 'User ID and Role Name are required.' });
  }
  
  // Define permissions logic for consistency
  const adminRoles = ['Super Admin', 'Client Admin'];
  const adminPermissions = [
      'user:read', 'user:write', 'user:delete', 
      'payroll:read', 'payroll:write', 
      'recruitment:read', 'recruitment:write', 
      'reports:read', 'reports:export', 
      'role:manage'
  ];
  
  try {
    // 1. Role Initialization/Update Logic (Roles Schema)
    // Ensures the target role exists in the Role schema with the correct default permissions.
    const initialPermissions = adminRoles.includes(roleName) 
        ? adminPermissions 
        : [];
        
    await Role.findOneAndUpdate(
        { name: roleName },
        { $set: { permissions: initialPermissions } },
        // upsert: true will create the role definition if it doesn't exist
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // This solves the 'Role definition not found' error by creating it on the fly.

    // 2. User Role Update Logic (User Schema)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update the user's role
    const oldRole = user.role;
    user.role = roleName;
    await user.save();

    res.json({ 
        message: `Role successfully updated from ${oldRole} to ${roleName} for user ${user.email}. Role permissions definition was also updated/created.`, 
        user: { id: user._id, role: user.role } 
    });
  } catch (error) {
    console.error('Error updating user role and permissions:', error);
    res.status(500).json({ message: 'Server error during role update', error });
  }
};

// --- 3. Get access rules for a specific role (Accessible to Super Admin) ---
exports.getRoleAccessRules = async (req, res) => {
  const { roleName } = req.params;

  try {
    const role = await Role.findOne({ name: roleName });

    if (!role) {
      return res.status(404).json({ message: `Role "${roleName}" not found.` });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching role access rules', error });
  }
};

// --- 4. Modify access rights dynamically (Accessible to Super Admin) ---
exports.modifyRoleAccess = async (req, res) => {
  const { roleName } = req.params;
  const { permissions } = req.body; // Array of permissions to set

  if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Permissions must be an array.' });
  }

  try {
    const role = await Role.findOneAndUpdate(
      { name: roleName },
      { $set: { permissions: permissions } }, // Overwrite existing permissions
      { new: true, upsert: false } // Return the modified document, don't create if not found
    );

    if (!role) {
      return res.status(404).json({ message: `Role "${roleName}" not found.` });
    }

    res.json({ 
        message: `Access rights for role ${roleName} updated successfully.`,
        role 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error modifying access rights', error });
  }
};