const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const companyRoutes = require('./routes/companyRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Enable CORS
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static File Serving
// 1. Client assets & pages
app.use(express.static(path.join(__dirname, '../client')));
// 2. Uploaded files (logos, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Employee Salary Slip Generator API',
    time: new Date().toISOString()
  });
});

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/salary-slips', salaryRoutes);
app.use('/api/ai', aiRoutes);

// Fallback for SPA/Client Routing
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found.' });
  }
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Centralized Error Handler Middleware
app.use(errorHandler);

module.exports = app;
