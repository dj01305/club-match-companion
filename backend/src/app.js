require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initDb } = require('./db/db');

const authRoutes = require('./routes/auth.routes');
const notesRoutes = require('./routes/notes.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

app.use(express.json());
app.use(cors());

// Limit auth endpoints to 10 requests per 15 minutes per IP.
// Prevents brute-force and credential-stuffing attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
  skip: () => process.env.NODE_ENV === 'test', // don't interfere with tests
});

app.use('/auth', authLimiter);
app.use('/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// initDb must be called before the app handles any requests.
// We export a factory function so tests can await initialization cleanly.
async function createApp() {
  await initDb();
  return app;
}

module.exports = { app, createApp };
