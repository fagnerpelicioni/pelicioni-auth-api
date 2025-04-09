const mongoose = require('mongoose');
const companySchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        max: 255,
        min: 4,
    },
    name: {
        type: String,
        required: true,
        min: 2,
        max: 255,
    },
    cnpj: {
        type: String,
        required: true,
        unique: true,
        max: 255,
        min: 6,
    },
    active: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);