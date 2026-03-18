const mongoose = require('mongoose');
const express = require('express');
const connectDB = require('./config/db');
const { specs, swaggerUi } = require('./config/swagger');
const cors = require('cors');
require('dotenv').config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// MongoDB connection event
mongoose.connection.once('open', async () => {
  try {
    const count = await mongoose.connection.db.collection('driverbookings').countDocuments();
    console.log(`DriverBookings collection has ${count} documents`);
  } catch (error) {
    console.log('DriverBookings collection not found or error counting documents');
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Fleet Management API Documentation'
}));

// Import routes
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverBookingRoutes = require('./routes/driverBookingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const userRoutes = require('./routes/userRoutes');
const fuelRoutes = require('./routes/fuelRoutes');
const adminRoutes = require('./routes/adminRoutes');
const driverRoutes = require('./routes/driverRoutes');

// Routes
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/driver-booking', driverBookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/driver', driverRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
});

// SUPER ADMIN CREATION
app.post('/api/create-super-admin', async (req, res) => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    const { employeeNumber = 'SUPER001', email = 'super@admin.com', password = 'admin123' } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Super admin already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const superAdmin = await User.create({
      employeeNumber,
      email,
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super-admin',
      permissions: {
        dashboard: true,
        userManagement: true,
        vehicleManagement: true,
        tripManagement: true,
        maintenanceManagement: true,
        fuelManagement: true,
        analytics: true,
        compliance: true,
        systemSettings: true,
        communication: true
      },
      isAdmin: true,
      status: 'Active'
    });
    
    res.status(201).json({
      success: true,
      message: 'Super admin created successfully',
      data: superAdmin
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling middleware
const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Ì∫Ä Server running on port ${PORT}`);
  console.log(`Ì≥ö Swagger Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`Ì≥ä Admin routes available at /api/admin`);
  console.log(`Ì±• User management available at /api/user`);
  console.log(`Ì±§ Driver routes available at /api/driver`);
  console.log(`ÌæØ Super admin creation at /api/create-super-admin`);
  console.log(`‚ù§Ô∏è  Health check at /api/health`);
});
