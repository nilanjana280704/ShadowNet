/**
 * ShadowNet Backend â€” process entry point.
 * Loads environment, connects to MongoDB, then starts the HTTP server.
 * Keep this file free of application logic â€” it only boots the app.
 */
require('dotenv').config();

const http = require('http');

const app = require('./src/app');
const connectDatabase = require('./src/config/db');
const env = require('./src/config/env');

const server = http.createServer(app);

async function start() {
  try {
    await connectDatabase(env.mongoUri);
    server.listen(env.port, () => {
      console.log(`[shadownet] API listening on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (error) {
    console.error('[shadownet] Failed to start server:', error);
    process.exit(1);
  }
}

/** Graceful shutdown so in-flight requests finish before exit. */
function shutdown(signal) {
  console.log(`[shadownet] ${signal} received, shutting down`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
