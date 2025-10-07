const mongoose = require('mongoose');
const express = require('express');
const connectDB = require('./config/db');

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
    console.log('✅ Cleared existing users');

    // Create the super admin user
    const superAdmin = await User.create({
      employeeNumber: employeeNumber,
      email: email,
      password: password, // This will be hashed by the pre-save hook
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
    console.log('✅ Super admin created in database');

    // Verify the user was created by finding it again
    const verifiedUser = await User.findOne({ email: email });
    if (!verifiedUser) {
      throw new Error('User creation failed - user not found after creation');
    }
    console.log('✅ Super admin verified in database');

    // Return success response
    res.status(201).json({
      success: true,
      message: 'SUPER ADMIN CREATED SUCCESSFULLY!',
      data: {
        email: verifiedUser.email,
        role: verifiedUser.role,
        employeeNumber: verifiedUser.employeeNumber,
        permissions: verifiedUser.permissions
      }
    });

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    res.status(500).json({
      success: false,
      message: `Failed to create super admin: ${error.message}`
    });
  }
});

// DIRECT DATABASE CHECK
app.get('/api/check-users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find({}).select('email employeeNumber role status');
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// MANUAL PASSWORD RESET
app.post('/api/reset-super-admin-password', async (req, res) => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    const { email = 'super@admin.com', newPassword = 'admin123' } = req.body;

    // Find the user
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Manually hash and set the password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.passwordChangedAt = Date.now() - 1000;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        email: user.email,
        passwordReset: 'completed'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// FIX SUBSIDIARY MODEL ERROR
app.post('/api/fix-subsidiary-model', async (req, res) => {
  try {
    // Create Subsidiary model if it doesn't exist
    const subsidiarySchema = new mongoose.Schema({
      name: {
        type: String,
        required: [true, 'Subsidiary name is required'],
        trim: true
      },
      code: {
        type: String,
        required: [true, 'Subsidiary code is required'],
        unique: true,
        trim: true
      },
      address: {
        type: String,
        trim: true
      },
      contactEmail: {
        type: String,
        trim: true
      },
      contactPhone: {
        type: String,
        trim: true
      },
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
      }
    }, {
      timestamps: true
    });

    // Check if model already exists, if not create it
    let Subsidiary;
    try {
      Subsidiary = mongoose.model('Subsidiary');
    } catch {
      Subsidiary = mongoose.model('Subsidiary', subsidiarySchema);
    }

    res.json({
      success: true,
      message: 'Subsidiary model fixed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// BYPASS ROUTES FOR TESTING (No authentication needed)
app.use('/api/admin/test', (req, res, next) => {
  // Simulate super-admin user with all permissions
  req.user = {
    _id: '65a1b2c3d4e5f6a7b8c9d0e1',
    email: 'test-super-admin@company.com',
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
    hasPermission: function(permission) { 
      return true; 
    },
    canAccessDepartment: function() { return true; }
  };
  next();
});

// Test routes with bypass - INCLUDING POST ROUTES
const adminController = require('./controllers/adminController');
app.get('/api/admin/test/dashboard', adminController.getDashboardOverview);
app.get('/api/admin/test/users', adminController.getUsers);
app.post('/api/admin/test/users', adminController.createUser);
app.put('/api/admin/test/users/:id', adminController.updateUser);
app.get('/api/admin/test/vehicles', adminController.getVehicles);
app.post('/api/admin/test/vehicles', adminController.createVehicle);
app.get('/api/admin/test/trips', adminController.getTrips);
app.post('/api/admin/test/trips', adminController.createTrip);
app.get('/api/admin/test/maintenance', adminController.getMaintenance);
app.post('/api/admin/test/maintenance', adminController.scheduleMaintenance);
app.put('/api/admin/test/maintenance/:id', adminController.updateMaintenance);
app.patch('/api/admin/test/maintenance/:id/complete', adminController.completeMaintenance);
app.get('/api/admin/test/fuel', adminController.getFuelRecords);
app.post('/api/admin/test/fuel', adminController.addFuelRecord);
app.get('/api/admin/test/analytics', adminController.getAnalytics);
app.get('/api/admin/test/compliance', adminController.getComplianceSafety);
app.get('/api/admin/test/system', adminController.getSystemAccess);

// TEST DATA CREATION ENDPOINTS
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

// GET REAL IDs FOR TESTING
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

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
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
  console.log(`📊 Admin routes available at /api/admin`);
  console.log(`👥 User management available at /api/user`);
  console.log(`🎯 Super admin creation at /api/create-super-admin`);
  console.log(`🔍 Check users at /api/check-users`);
  console.log(`🔧 Reset password at /api/reset-super-admin-password`);
  console.log(`🔧 Fix subsidiary model at /api/fix-subsidiary-model`);
  console.log(`🧪 Create test data at /api/test/create-test-data`);
  console.log(`🆔 Get real IDs at /api/test/get-ids`);
  console.log(`🔓 TEST MODE: Bypass routes at /api/admin/test/*`);
  console.log(`❤️  Health check at /api/health`);
  console.log(`\n📝 QUICK START:`);
  console.log(`1. POST /api/create-super-admin`);
  console.log(`2. POST /api/fix-subsidiary-model`);
  console.log(`3. POST /api/test/create-test-data (creates test driver & vehicle)`);
  console.log(`4. GET /api/test/get-ids (get real IDs for testing)`);
  console.log(`5. Use bypass routes for testing: /api/admin/test/*`);
});