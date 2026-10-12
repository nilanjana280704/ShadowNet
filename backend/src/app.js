/**
 * ShadowNet Backend â€” Express application.
 * Wires global middleware and mounts module routers.
 * No business logic lives here.
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');

const app = express();

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'shadownet-api' });
});

// ---------------------------------------------------------------------------
// API routes â€” module routers are mounted here as they are implemented.
// Example (future milestones):
//   app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
// ---------------------------------------------------------------------------

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// Central error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(env.nodeEnv !== 'production' && { stack: err.stack }),
  });
});

module.exports = app;
