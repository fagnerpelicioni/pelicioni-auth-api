const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        max: 255,
        min: 6,
    },
    password: {
        type: String,
        required: true,
        min: 8,
        max: 1024,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    active: {
        type: Boolean,
        default: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);