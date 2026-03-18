const axios = require('axios');
require('dotenv').config();

const API_URL = 'https://fleet-managemnt-backend-last.onrender.com';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YTgyYjc2MjVhMzdkMWQ5YjQ2MjQ4MiIsImlhdCI6MTc3MzgyMTA2MSwiZXhwIjoxNzc2NDEzMDYxfQ.TTVuR1bvgPQu7H-77XMY4mAsSRuOnMA2tdDz-RRJdRk';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`
};

async function diagnose() {
  console.log('��� DIAGNOSIS STARTING...\n');

  // Test 1: Check if API is reachable
  try {
    const health = await axios.get(`${API_URL}/api/health`);
    console.log('✅ API Health Check:', health.data);
  } catch (error) {
    console.log('❌ API Health Check Failed:', error.message);
  }

  // Test 2: Check departments
  try {
    const depts = await axios.get(`${API_URL}/api/departments/`, { headers });
    console.log('✅ Departments:', depts.data.data.length, 'found');
  } catch (error) {
    console.log('❌ Departments Error:', error.response?.data || error.message);
  }

  // Test 3: Check vehicle model requirements
  console.log('\n⚠️  To fix vehicle creation, check the model at:');
  console.log('   cat models/Vehicle.js | grep -A 5 "required: true"');

  // Test 4: Check user model
  console.log('\n⚠️  To fix user registration, check:');
  console.log('   cat models/User.js | grep -A 15 "getDefaultPermissions"');
}

diagnose();
