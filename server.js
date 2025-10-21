const mongoose = require('mongoose');
const express = require('express');
const connectDB = require('./config/db');
const { specs, swaggerUi } = require('./config/swagger');

// Initialize express app
const app = express();

// Environment configuration
require('dotenv').config();

// Middleware imports
const cors = require('cors');

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

// Routes
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/driver-booking', driverBookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/admin', adminRoutes);

// GUARANTEED SUPER ADMIN CREATION
/**
 * @swagger
 * /api/create-super-admin:
 *   post:
 *     summary: Create a super admin user (Development Only)
 *     description: This endpoint creates a super admin user with full permissions. Remove in production.
 *     tags: [Authentication]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeNumber:
 *                 type: string
 *                 example: "SUPER001"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "super@admin.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "admin123"
 *               firstName:
 *                 type: string
 *                 example: "Super"
 *               lastName:
 *                 type: string
 *                 example: "Admin"
 *     responses:
 *       201:
 *         description: Super admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "SUPER ADMIN CREATED SUCCESSFULLY!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     employeeNumber:
 *                       type: string
 *                     permissions:
 *                       type: object
 *       500:
 *         description: Internal server error
 */
app.post('/api/create-super-admin', async (req, res) => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    const { 
      employeeNumber = 'SUPER001', 
      email = 'super@admin.com', 
      password = 'admin123', 
      firstName = 'Super', 
      lastName = 'Admin' 
    } = req.body;

    console.log('🔄 Creating super admin...');
    
    // Delete any existing user with same email or employee number
    await User.deleteMany({
      $or: [
        { email: email },
        { employeeNumber: employeeNumber }
      ]
    });

    // Create the super admin user
    const superAdmin = await User.create({
      employeeNumber: employeeNumber,
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
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

    // Verify the user was created by finding it again
    const verifiedUser = await User.findOne({ email: email });
    if (!verifiedUser) {
      throw new Error('User creation failed - user not found after creation');
    }

    // Remove password from response
    const userResponse = verifiedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'SUPER ADMIN CREATED SUCCESSFULLY!',
      data: userResponse
    });

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    res.status(500).json({
      success: false,
      message: `Failed to create super admin: ${error.message}`
    });
  }
});

// HEALTH CHECK
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Server is running successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
});

// TEST DATA CREATION
/**
 * @swagger
 * /api/test/create-test-data:
 *   post:
 *     summary: Create test data (Development Only)
 *     tags: [Testing]
 *     responses:
 *       200:
 *         description: Test data created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     driverId:
 *                       type: string
 *                     vehicleId:
 *                       type: string
 *                     departmentId:
 *                       type: string
 */
app.post('/api/test/create-test-data', async (req, res) => {
  try {
    const User = require('./models/User');
    const Vehicle = require('./models/Vehicle');
    const Department = require('./models/Department');
    const bcrypt = require('bcryptjs');

    // Create a test department if none exists
    let department = await Department.findOne();
    if (!department) {
      department = await Department.create({
        name: 'Transport Department',
        description: 'Main transport and logistics department'
      });
    }

    // Create test driver
    const driver = await User.create({
      employeeNumber: 'DRV001',
      email: 'driver@test.com',
      password: 'driver123',
      firstName: 'Test',
      lastName: 'Driver',
      phone: '+255123456789',
      department: department._id,
      role: 'driver',
      licenseNumber: 'DL123456',
      licenseExpiry: '2025-12-31'
    });

    // Create test vehicle
    const vehicle = await Vehicle.create({
      registration: 'TEST001',
      make: 'Toyota',
      model: 'Hilux',
      year: 2022,
      color: 'White',
      vehicleType: 'truck',
      fuelType: 'diesel',
      department: department._id,
      insuranceExpiry: '2024-12-31',
      status: 'available'
    });

    res.json({
      success: true,
      message: 'Test data created successfully',
      data: {
        driverId: driver._id,
        vehicleId: vehicle._id,
        departmentId: department._id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET REAL IDs
/**
 * @swagger
 * /api/test/get-ids:
 *   get:
 *     summary: Get real IDs for testing
 *     tags: [Testing]
 *     responses:
 *       200:
 *         description: IDs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     drivers:
 *                       type: array
 *                     vehicles:
 *                       type: array
 *                     departments:
 *                       type: array
 */
app.get('/api/test/get-ids', async (req, res) => {
  try {
    const User = require('./models/User');
    const Vehicle = require('./models/Vehicle');
    const Department = require('./models/Department');

    const drivers = await User.find({ role: 'driver' }).select('_id firstName lastName');
    const vehicles = await Vehicle.find().select('_id registration make model');
    const departments = await Department.find().select('_id name');

    res.json({
      success: true,
      data: {
        drivers,
        vehicles,
        departments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`📊 Admin routes available at /api/admin`);
  console.log(`👥 User management available at /api/user`);
  console.log(`🎯 Super admin creation at /api/create-super-admin`);
  console.log(`🧪 Create test data at /api/test/create-test-data`);
  console.log(`🆔 Get real IDs at /api/test/get-ids`);
  console.log(`❤️  Health check at /api/health`);
});