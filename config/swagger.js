const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fleet Management API',
      version: '1.0.0',
      description: 'A comprehensive Fleet Management System API for managing vehicles, drivers, trips, maintenance, and fuel records. Use the **Create Super Admin** endpoint first to get started, then use the login endpoint to get your JWT token.',
      contact: {
        name: 'API Support',
        email: 'support@fleetmanagement.com'
      },
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['employeeNumber', 'email', 'password', 'firstName', 'lastName'],
          properties: {
            employeeNumber: {
              type: 'string',
              description: 'Unique employee number',
              example: 'EMP001'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@company.com'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password (min 6 characters)',
              example: 'password123'
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe'
            },
            role: {
              type: 'string',
              enum: ['super-admin', 'admin', 'fleet-manager', 'dispatcher', 'driver', 'viewer', 'user'],
              description: 'User role',
              example: 'driver'
            },
            phone: {
              type: 'string',
              description: 'User phone number',
              example: '+255123456789'
            },
            department: {
              type: 'string',
              description: 'Department ID',
              example: '65a1b2c3d4e5f6a7b8c9d0e1'
            },
            licenseNumber: {
              type: 'string',
              description: 'Driver license number',
              example: 'DL123456'
            },
            licenseExpiry: {
              type: 'string',
              format: 'date',
              description: 'License expiry date',
              example: '2025-12-31'
            }
          }
        },
        Vehicle: {
          type: 'object',
          required: ['registration', 'make', 'model', 'year', 'vehicleType', 'fuelType'],
          properties: {
            registration: {
              type: 'string',
              description: 'Vehicle registration number',
              example: 'ABC123'
            },
            make: {
              type: 'string',
              description: 'Vehicle manufacturer',
              example: 'Toyota'
            },
            model: {
              type: 'string',
              description: 'Vehicle model',
              example: 'Camry'
            },
            year: {
              type: 'integer',
              description: 'Manufacturing year',
              example: 2023
            },
            color: {
              type: 'string',
              description: 'Vehicle color',
              example: 'White'
            },
            vehicleType: {
              type: 'string',
              enum: ['car', 'truck', 'van', 'bus', 'motorcycle'],
              description: 'Type of vehicle',
              example: 'car'
            },
            fuelType: {
              type: 'string',
              enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
              description: 'Type of fuel',
              example: 'petrol'
            },
            department: {
              type: 'string',
              description: 'Department ID',
              example: '65a1b2c3d4e5f6a7b8c9d0e1'
            },
            insuranceExpiry: {
              type: 'string',
              format: 'date',
              description: 'Insurance expiry date',
              example: '2024-12-31'
            },
            notes: {
              type: 'string',
              description: 'Additional notes',
              example: 'New vehicle added to fleet'
            }
          }
        },
        Trip: {
          type: 'object',
          required: ['driverId', 'vehicleId', 'passengerName', 'passengerContact', 'pickupLocation', 'destination', 'scheduledPickupTime'],
          properties: {
            driverId: {
              type: 'string',
              description: 'Driver ID',
              example: '65a1b2c3d4e5f6a7b8c9d0e2'
            },
            vehicleId: {
              type: 'string',
              description: 'Vehicle ID',
              example: '65a1b2c3d4e5f6a7b8c9d0e3'
            },
            passengerName: {
              type: 'string',
              description: 'Passenger name',
              example: 'Jane Smith'
            },
            passengerContact: {
              type: 'string',
              description: 'Passenger contact information',
              example: '+255123456788'
            },
            pickupLocation: {
              type: 'string',
              description: 'Pickup location',
              example: 'Office Headquarters'
            },
            destination: {
              type: 'string',
              description: 'Destination',
              example: 'Airport Terminal 1'
            },
            scheduledPickupTime: {
              type: 'string',
              format: 'date-time',
              description: 'Scheduled pickup time',
              example: '2024-01-20T10:00:00.000Z'
            },
            purpose: {
              type: 'string',
              description: 'Trip purpose',
              example: 'Airport transfer for executive meeting'
            },
            department: {
              type: 'string',
              description: 'Department ID',
              example: '65a1b2c3d4e5f6a7b8c9d0e1'
            }
          }
        },
        Maintenance: {
          type: 'object',
          required: ['vehicleId', 'maintenanceType', 'description', 'scheduledDate', 'cost'],
          properties: {
            vehicleId: {
              type: 'string',
              description: 'Vehicle ID',
              example: '65a1b2c3d4e5f6a7b8c9d0e3'
            },
            maintenanceType: {
              type: 'string',
              enum: ['routine', 'repair', 'inspection', 'accident-repair', 'other'],
              description: 'Type of maintenance',
              example: 'routine'
            },
            description: {
              type: 'string',
              description: 'Maintenance description',
              example: 'Regular oil change and filter replacement'
            },
            scheduledDate: {
              type: 'string',
              format: 'date-time',
              description: 'Scheduled maintenance date',
              example: '2024-02-01T09:00:00.000Z'
            },
            cost: {
              type: 'number',
              description: 'Estimated cost',
              example: 150
            },
            serviceProvider: {
              type: 'string',
              description: 'Service provider name',
              example: 'AutoCare Center'
            },
            partsReplaced: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { 
                    type: 'string',
                    example: 'Engine Oil'
                  },
                  partNumber: { 
                    type: 'string',
                    example: 'OIL-001'
                  },
                  cost: { 
                    type: 'number',
                    example: 80
                  }
                }
              }
            }
          }
        },
        Fuel: {
          type: 'object',
          required: ['vehicleId', 'fuelingDate', 'odometerReading', 'fuelAmount', 'fuelType', 'costPerUnit', 'fuelingLocation'],
          properties: {
            vehicleId: {
              type: 'string',
              description: 'Vehicle ID',
              example: '65a1b2c3d4e5f6a7b8c9d0e3'
            },
            driverId: {
              type: 'string',
              description: 'Driver ID',
              example: '65a1b2c3d4e5f6a7b8c9d0e2'
            },
            fuelingDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fueling date and time',
              example: '2024-01-15T14:30:00.000Z'
            },
            odometerReading: {
              type: 'number',
              description: 'Odometer reading at fueling',
              example: 15000
            },
            fuelAmount: {
              type: 'number',
              description: 'Amount of fuel added',
              example: 45.5
            },
            fuelType: {
              type: 'string',
              enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
              description: 'Type of fuel',
              example: 'petrol'
            },
            costPerUnit: {
              type: 'number',
              description: 'Cost per unit of fuel',
              example: 1.65
            },
            fuelingLocation: {
              type: 'string',
              description: 'Fueling location',
              example: 'Shell Station Downtown'
            },
            fuelCardNumber: {
              type: 'string',
              description: 'Fuel card number',
              example: 'FC123456789'
            },
            receiptNumber: {
              type: 'string',
              description: 'Receipt number',
              example: 'RCPT7890123'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error description'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Not authorized, token failed'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'User not found'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Validation failed: email: Email is required'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js', './server.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };