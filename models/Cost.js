const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
    amount: Number,
    category: String,
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    description: String,
    incurredDate: Date,
    relatedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    relatedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    costId: String,
}, { timestamps: true });

module.exports = mongoose.model('Cost', costSchema);