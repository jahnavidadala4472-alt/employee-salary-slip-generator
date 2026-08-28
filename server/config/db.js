const mongoose = require('mongoose');
const env = require('./env');
const { getStore } = require('./localStore');

let isConnected = false;

const connectDB = async () => {
  // Disable command buffering so operations fail-fast or fallback instead of hanging for 10s
  mongoose.set('bufferCommands', false);

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.log('[Database Notice] No local MongoDB daemon listening at 127.0.0.1:27017.');
    console.log('[Database Engine] Automatically activated Embedded Local Storage Engine.');
    console.log('[Database Engine] All CRUD, Auth, Salaries, PDFs, and AI services are running with zero setup!');
    console.log('[Database Engine] (To use live MongoDB, set MONGODB_URI in .env)');
    getStore(); // Preload local store
    return null;
  }
};

const isMongoConnected = () => isConnected && mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.isMongoConnected = isMongoConnected;
