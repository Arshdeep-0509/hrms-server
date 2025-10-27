const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv')
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const roleRoutes = require('./modules/role/role.routes');
const organizationRoutes = require('./modules/organization/organization.routes');
const financeRoutes = require('./modules/finance/finance.routes');
const recruitmentRoutes = require('./modules/recruitment/recruitment.routes');
const employeeRoutes = require('./modules/employee/employee.routes');
const payrollRoutes = require('./modules/payroll/payroll.routes');
const departmentRoutes = require('./modules/department/department.routes');

dotenv.config()
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());

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
app.use('/api/departments', departmentRoutes);

  // Simple health check route
app.get('/', (req, res) => {
  res.status(200).send('RBAC Auth API is running.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});