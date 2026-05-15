const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('⚠️  MONGODB_URI environment variable is not set. Running without database.');
    console.log('📝 Note: Some features may not work without a database connection.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      bufferCommands: false,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`⚠️  MongoDB connection failed: ${error.message}`);
    console.log('📝 Running without database connection. Some features may not work.');
    console.log('💡 To fix: Check your MONGODB_URI and ensure your IP is whitelisted in Atlas.');
  }
};

module.exports = connectDB;
