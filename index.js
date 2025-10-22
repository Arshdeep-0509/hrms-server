const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv')
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

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

  // Simple health check route
app.get('/', (req, res) => {
  res.status(200).send('RBAC Auth API is running.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});