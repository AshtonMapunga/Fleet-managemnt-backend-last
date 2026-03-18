const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fleet Management API',
      version: '1.0.0',
      description: 'Complete Fleet Management System API with vehicles, drivers, trips, maintenance, fuel, departments, driver bookings, and more.',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Local development server',
      },
      {
        url: 'https://fleet-managemnt-backend-last.onrender.com',
        description: 'Production server on Render',
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User registration and login endpoints' },
      { name: 'Users', description: 'User profile management endpoints' },
      { name: 'Drivers', description: 'Driver management endpoints' },
      { name: 'Vehicles', description: 'Vehicle management endpoints' },
      { name: 'Departments', description: 'Department management endpoints' },
      { name: 'Driver Bookings', description: 'Driver booking management endpoints' },
      { name: 'Fuel', description: 'Fuel management endpoints' },
      { name: 'Maintenance', description: 'Maintenance management endpoints' },
      { name: 'Trips', description: 'Trip management endpoints' },
      { name: 'Admin', description: 'Admin-only endpoints' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
  ],
};

const specs = swaggerJsdoc(options);
const swaggerUi = require('swagger-ui-express');

module.exports = { specs, swaggerUi };
