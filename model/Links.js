const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    name: { type: String, required: true },
    link: { type: String, required: true },
    userEmail: { type: String, required: true } // Ensure this is a String
});

module.exports = mongoose.model('Link', LinkSchema);