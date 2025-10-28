const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger/swagger.config');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const roleRoutes = require('./modules/role/role.routes');
const organizationRoutes = require('./modules/organization/organization.routes');
const financeRoutes = require('./modules/finance/finance.routes');
const recruitmentRoutes = require('./modules/recruitment/recruitment.routes');
const employeeRoutes = require('./modules/employee/employee.routes');
const payrollRoutes = require('./modules/payroll/payroll.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');

dotenv.config()
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'HRMS API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
}));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process on connection failure
  });

  // Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/attendance', attendanceRoutes);

  // Simple health check route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'HRMS API is running.',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      roles: '/api/roles',
      organizations: '/api/organizations',
      employees: '/api/employees',
      payroll: '/api/payroll',
      attendance: '/api/attendance',
      finance: '/api/finance',
      recruitment: '/api/recruitment'
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});