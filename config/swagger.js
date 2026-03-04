const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fleet Management API',
      version: '1.0.0',
      description: 'A comprehensive Fleet Management System API for managing vehicles, drivers, trips, maintenance, and fuel records. Use the Create Super Admin endpoint first to get started, then use the login endpoint to get your JWT token.',
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
  apis: ['./routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);
const swaggerUi = require('swagger-ui-express');

module.exports = { specs, swaggerUi };
