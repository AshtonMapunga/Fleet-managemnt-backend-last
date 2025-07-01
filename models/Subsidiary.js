const mongoose = require('mongoose');

const subsidiarySchema = new mongoose.Schema({
    subsidiaryName: String,
    subsidiaryDescription: String,
}, { timestamps: true });

module.exports = mongoose.model('Subsidiary', subsidiarySchema);