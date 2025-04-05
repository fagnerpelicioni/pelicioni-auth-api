const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();

dotenv.config();
const authRoutes = require('./routes/auth');
const linksRoutes = require('./routes/links');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false)
        mongoose.connect(process.env.MONGO_URI) 
        console.log('Mongo connected')
    } catch(error) {
        console.log(error)
        process.exit()
    }
}

connectDB();

app.use(express.json());

app.use('/api/user', authRoutes);
app.use('/api/', linksRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});