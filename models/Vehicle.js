const mongoose = require('mongoose');

const zinaraDetailsSchema = new mongoose.Schema({
    roadTax: Number,
    expiryDate: Date,
});

const radioDetailsSchema = new mongoose.Schema({
    radioLicenseFee: Number,
    expiryDate: Date,
});

const insuranceDetailsSchema = new mongoose.Schema({
    insuranceProvider: String,
    policyNumber: String,
    expiryDate: Date,
});

const licenseDetailsSchema = new mongoose.Schema({
    vehicleId: String,
    licensePlate: String,
    licenseExpiryDate: Date,
    licenseRenewalDate: Date,
    licensedBy: String,
    licenseDiskReference: String,
    issuedDate: Date,
    status: String,
});

const vehicleSchema = new mongoose.Schema({
    passengerCapacity: Number,
    vehicleId: String,
    vehicleReg: { type: String, unique: true },
    vehicleCategory: String,
    band: String,
    vehicleStatus: String,
    fuelLevel: Number,
    currentLocation: String,
    costPerKm: Number,
    ignitionStatus: Boolean,
    nextMaintenanceDate: Date,
    nextLicenseRenewalDate: Date,
    vehiclePin: String,
    chasisNumber: String,
    engineNumber: String,
    make: String,
    model: String,
    colour: String,
    taxClass: String,
    fuelType: String,
    purchaseDate: Date,
    disposalDate: Date,
    zinaraDetails: zinaraDetailsSchema,
    radioDetails: radioDetailsSchema,
    insuranceDetails: insuranceDetailsSchema,
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    licenseDetails: licenseDetailsSchema,
    trackingDetails: {
        terminalId: String,
        terminalSerial: String,
        defaultTimezone: String,
        monthlyMileageLimit: Number,
        tollingTagId: String,
        vehicleName: String,
        maxSpeed: Number,
        homeGeofence: String,
        modelYear: Number,
        sensors: {
            fuelCanbusConsumed: Boolean,
            fuelCanbusLevel: Boolean,
            fuelAnalogLevel: Boolean,
            electricBattery: Boolean,
            electricCharging: Boolean
        }
    },
    customFields: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);