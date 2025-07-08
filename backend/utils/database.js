const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI ;
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};


const testConnection = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

module.exports = { connectDB, testConnection };
