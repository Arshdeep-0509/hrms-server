const authService = require('./auth.service');

class AuthController {
  /**
   * Register new user
   */
  async registerUser(req, res) {
    try {
      const result = await authService.registerUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Registration Error:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during registration' });
    }
  }

  /**
   * Login user
   */
  async loginUser(req, res) {
    try {
      const result = await authService.loginUser(req.body);
      res.json(result);
    } catch (error) {
      console.error('Login Error:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || 'Server error during login' });
    }
  }

  /**
   * Logout user
   */
  logoutUser(req, res) {
    const result = authService.logoutUser();
    res.status(200).json(result);
  }
}

module.exports = new AuthController();

