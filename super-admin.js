const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    employeeNumber: String,
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    role: String,
    permissions: Object,
    isAdmin: Boolean,
    status: String
});

const User = mongoose.model('User', userSchema);

async function createSuperAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if super admin already exists
        const existingAdmin = await User.findOne({ email: 'superadmin@company.com' });
        if (existingAdmin) {
            console.log('Super admin already exists');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 12);

        // Create super admin
        const superAdmin = new User({
            employeeNumber: 'SUPER001',
            email: 'superadmin@company.com',
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
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

        await superAdmin.save();
        console.log('Super admin created successfully!');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createSuperAdmin();