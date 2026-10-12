/**
 * MongoDB connection via Mongoose.
 * Exports a single connect function used by server.js at boot.
 */
const mongoose = require('mongoose');

async function connectDatabase(mongoUri) {
  mongoose.connection.on('connected', () => {
    console.log('[shadownet] MongoDB connected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('[shadownet] MongoDB connection error:', error);
  });

  await mongoose.connect(mongoUri);
  return mongoose.connection;
}

module.exports = connectDatabase;
