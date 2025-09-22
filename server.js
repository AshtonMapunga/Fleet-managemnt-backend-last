const mongoose = require('mongoose');
const express = require('express');
const connectDB = require('./config/db');

// Initialize express app
const app = express();

// Environment configuration
const env = require('./config/env');
require('dotenv').config(); // Load .env variables

// Other middleware imports
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const fuelRoutes = require('./routes/fuelRoutes');

// Connect to MongoDB
connectDB();

// Email configuration (AFTER dotenv config)
const emailTransporter = require('./config/emailConfig');

// MongoDB connection event
mongoose.connection.once('open', async () => {
  const count = await mongoose.connection.db.collection('driverbookings').countDocuments();
  console.log(`DriverBookings collection has ${count} documents`);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
})); 


// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Data sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Import routes
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverBookingRoutes = require('./routes/driverBookingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const costRoutes = require('./routes/costRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const subsidiaryRoutes = require('./routes/subsidiaryRoutes');
const accidentRoutes = require('./routes/accidentRoutes');
const userRoutes = require('./routes/userRoutes');
const shuttleRoutes = require('./routes/shuttleRoutes');
const parkingRoutes = require('./routes/parkingRoutes');

// Routes
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/driver-booking', driverBookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/cost-management', costRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/subsidiary', subsidiaryRoutes);
app.use('/api/accidents', accidentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/shuttles', shuttleRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/fuel', fuelRoutes);

// Error handling middleware
const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Start server
const PORT = env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});