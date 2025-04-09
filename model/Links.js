const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    name: { type: String, required: true },
    link: { type: String, required: true },
    userEmail: { type: String, required: true },
    category: { type: String, enum: ['financeiro', 'manutencao', 'operacao', 'recursos', 'custom'], default: 'custom' },
});

module.exports = mongoose.model('Link', LinkSchema);