// backend/src/config/database.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50, // Good for high traffic
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Graceful shutdown
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Trying to reconnect...');
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

connectDB();

export default connectDB;