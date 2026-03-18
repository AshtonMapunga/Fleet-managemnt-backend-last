const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const API_URL = 'https://fleet-managemnt-backend-last.onrender.com';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YTgyYjc2MjVhMzdkMWQ5YjQ2MjQ4MiIsImlhdCI6MTc3MzgyMTA2MSwiZXhwIjoxNzc2NDEzMDYxfQ.TTVuR1bvgPQu7H-77XMY4mAsSRuOnMA2tdDz-RRJdRk';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`
};

async function populateData() {
  try {
    // 1. Create a department if needed
    console.log('Creating department...');
    const deptRes = await axios.post(`${API_URL}/api/departments/create`, {
      name: 'Test Department',
      description: 'For testing',
      budget: 1000000
    }, { headers });
    const deptId = deptRes.data.data._id;

    // 2. Create a vehicle
    console.log('Creating vehicle...');
    const vehicleRes = await axios.post(`${API_URL}/api/vehicle/create`, {
      registration: `TEST${Math.floor(Math.random()*1000)}`,
      make: 'Toyota',
      model: 'Hilux',
      year: 2023,
      vehicleType: 'truck',
      fuelType: 'diesel',
      department: deptId,
      insuranceExpiry: '2025-12-31',
      createdBy: '69a837cfe59e185be5106c31'
    }, { headers });

    // 3. Create a driver
    console.log('Creating driver...');
    const driverRes = await axios.post(`${API_URL}/api/user/register`, {
      employeeNumber: `DRV${Math.floor(Math.random()*1000)}`,
      email: `driver${Math.floor(Math.random()*1000)}@test.com`,
      password: 'driver123',
      firstName: 'Test',
      lastName: 'Driver',
      role: 'driver',
      department: deptId,
      licenseNumber: `DL${Math.floor(Math.random()*100000)}`,
      licenseExpiry: '2025-12-31'
    });

    console.log('✅ Data populated successfully!');
    console.log('Department ID:', deptId);
    console.log('Driver ID:', driverRes.data.data._id);
    console.log('Vehicle ID:', vehicleRes.data.data._id);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

populateData();
