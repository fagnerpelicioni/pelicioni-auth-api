const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Import the cors package
const app = express();

// Enable CORS for all routes
app.use(cors());
dotenv.config();
const authRoutes = require('./routes/auth');
const linksRoutes = require('./routes/links');
const companyRoutes = require('./routes/company');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Mongo connected');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); // Exit with failure
    }
};

connectDB();

app.use(express.json());

// Routes
app.use('/api/user', authRoutes);
app.use('/api/', linksRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/health', (req, res) => {
    res.status(200).json('OK');
});

// CORS Headers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// Export the serverless handler
module.exports = app;
module.exports.handler = (event, context, callback) => {
    app(event, context, callback);
};

// Start the server if not in serverless mode
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});