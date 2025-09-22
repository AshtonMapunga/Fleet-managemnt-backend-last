// server.js
require('dotenv').config(); // 1) load env ASAP

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const connectDB = require('./config/db');
const env = require('./config/env');

// ---- Create app
const app = express();

// ---- Trust proxy if deployed behind Render/NGINX (helps with HTTPS/secure cookies)
app.set('trust proxy', 1);

// ---- CORS (put this FIRST and be explicit)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  // Add your deployed frontend origin(s) here, e.g.:
  // 'https://your-frontend.onrender.com',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow mobile/SSR/no-origin requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Reject others
      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: false, // set to true ONLY if you send cookies/auth headers from the browser
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    optionsSuccessStatus: 204,
  })
);

// Explicit preflight handling for all routes (some hosts are picky)
app.options('*', cors());

// ---- Security headers
app.use(
  helmet({
    // Don’t apply CORP to block cross-origin fetches for APIs
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ---- Body parsers & logs
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ---- Rate limiting (adjust as needed)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ---- Sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// ---- Connect DB
connectDB();

// ---- Email config (after env)
const emailTransporter = require('./config/emailConfig');

// ---- Mongo connection events
mongoose.connection.on('open', async () => {
  try {
    const count = await mongoose.connection.db
      .collection('driverbookings')
      .countDocuments();
    console.log('DriverBookings collection has ${count} documents');
  } catch (err) {
    console.error('Error counting driverbookings:', err.message);
  }
});

mongoose.connection.on('error', (err) => {
  console.error('Mongo connection error:', err.message);
});

// ---- Routes
const fuelRoutes = require('./routes/fuelRoutes');
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

app.use('/api/fuel', fuelRoutes);
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

// ---- Health check (helpful for Render and quick diagnostics)
app.get('/healthz', (req, res) => res.status(200).json({ ok: true }));

// ---- Centralized error handler (make sure it runs AFTER routes)
const errorHandler = require('./middleware/errorMiddleware');
app.use((err, req, res, next) => {
  // If CORS origin validation threw an Error, return a clean 403 with CORS headers
  if (err instanceof Error && /not allowed by CORS/i.test(err.message)) {
    return res
      .status(403)
      .json({ success: false, message: err.message, code: 'CORS_ORIGIN' });
  }
  return errorHandler(err, req, res, next);
});

// ---- Start server
const PORT = env.PORT || process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});