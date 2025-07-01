const express = require('express');
const connectDB = require('./config/db');
const env = require('./config/env');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Import routes
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverBookingRoutes = require('./routes/driverBookingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const costRoutes = require('./routes/costRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const subsidiaryRoutes = require('./routes/subsidiaryRoutes');
const accidentRoutes = require('./routes/accidentRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

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

// Routes
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/driver-booking', driverBookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/cost-management', costRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/subsidiary', subsidiaryRoutes);
app.use('/api/accidents', accidentRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware
const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Start server
const PORT = env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});