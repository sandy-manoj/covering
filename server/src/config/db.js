const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    // Check if external/local mongo is explicitly configured and connectable
    if (mongoUri && !mongoUri.includes('127.0.0.1')) {
      const conn = await mongoose.connect(mongoUri);
      console.log(`Connected to Remote MongoDB: ${conn.connection.host}`);
      return;
    }

    try {
      const conn = await mongoose.connect(mongoUri || 'mongodb://127.0.0.1:27017/gold_covering_shop', {
        serverSelectionTimeoutMS: 2500
      });
      console.log(`Connected to Local MongoDB: ${conn.connection.host}`);
    } catch (localErr) {
      console.log('Local MongoDB not running. Initializing embedded high-performance MongoDB instance for development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`Connected to Embedded MongoDB Memory Server at: ${uri}`);

      // Auto seed initial data on first memory launch so client/admin always have 15 real products ready
      const Admin = require('../models/Admin');
      const count = await Admin.countDocuments();
      if (count === 0) {
        console.log('Seeding initial data into memory database...');
        const seed = require('../utils/seedRunner');
        await seed();
      }
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
  }
};

module.exports = connectDB;
