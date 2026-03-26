require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/db');

const authRoutes = require('./routes/auth.routes');
const notesRoutes = require('./routes/notes.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

app.use(express.json());
app.use(cors());

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
