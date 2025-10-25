const User = require('../user/user.schema');
const Role = require('../role/role.schema');
const jwt = require('jsonwebtoken');

class AuthService {
  /**
   * Generate JWT token
   * @param {String} id - User ID
   * @param {String} role - User role
   * @returns {String} JWT token
   */
  generateToken(id, role) {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
      expiresIn: '1d' // Token expires in 1 day
    });
  }

  /**
   * Register new user
   * @param {Object} userData - User data (name, email, password, role)
   * @returns {Promise<Object>} Registered user with token
   */
  async registerUser(userData) {
    const { name, email, password, role } = userData;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw { statusCode: 400, message: 'User already exists with this email.' };
    }

    // Determine the role to be assigned (default to Employee if not provided)
    const assignedRole = role || 'Employee';

    // 2. Define permissions based on the role
    const adminRoles = ['Super Admin', 'Client Admin'];
    const adminPermissions = [
      'user:read', 'user:write', 'user:delete',
      'payroll:read', 'payroll:write',
      'recruitment:read', 'recruitment:write',
      'reports:read', 'reports:export',
      'role:manage'
    ];

    // Set permissions based on the assigned role
    const initialPermissions = adminRoles.includes(assignedRole) ? adminPermissions : [];

    // 3. Ensure the Role document exists with defined permissions
    await Role.findOneAndUpdate(
      { name: assignedRole },
      { $set: { permissions: initialPermissions } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 4. Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole
    });

    if (!user) {
      throw { statusCode: 400, message: 'Invalid user data received' };
    }

    // 5. Generate token
    const token = this.generateToken(user._id, user.role);

    return {
      message: 'Registration successful, and role permissions initialized.',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    };
  }

  /**
   * Login user
   * @param {Object} credentials - User credentials (email, password)
   * @returns {Promise<Object>} User data with token
   */
  async loginUser(credentials) {
    const { email, password } = credentials;

    // 1. Find user (explicitly select password)
    const user = await User.findOne({ email }).select('+password');

    // 2. Check user existence and password match
    if (!user || !(await user.matchPassword(password))) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    // 3. Generate token
    const token = this.generateToken(user._id, user.role);

    return {
      message: 'Login successful',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    };
  }

  /**
   * Logout user (client-side token deletion)
   * @returns {Object} Success message
   */
  logoutUser() {
    return {
      message: 'Logged out successfully. Token should be deleted client-side.'
    };
  }
}

module.exports = new AuthService();

