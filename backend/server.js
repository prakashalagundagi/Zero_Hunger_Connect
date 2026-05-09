// Zero Hunger Connect — Express.js backend server
// Runs on port 8000 (frontend Vite dev server proxies /api/* to this port)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import route handlers
const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const requestRoutes = require('./routes/requests');
const dashboardRoutes = require('./routes/dashboard');
const deliveryRoutes = require('./routes/deliveries');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');

// Background jobs
const { startExpiryChecker, runExpiryCheck } = require('./jobs/expiryChecker');

const app = express();
const PORT = process.env.PORT || 8000;

// ── Middleware ────────────────────────────────────────────────────────────────

// Allow requests from the Vite dev server (port 5000) and any Replit preview domain
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    // and any localhost / replit.dev domain
    if (!origin) return callback(null, true);
    if (
      origin.includes('localhost') ||
      origin.includes('replit.dev') ||
      origin.includes('replit.app') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    callback(null, true); // Open CORS for development — restrict in production
  },
  credentials: true,
}));

app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: false }));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Zero Hunger Connect API is running', timestamp: new Date() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Admin / internal endpoints ────────────────────────────────────────────────
// Manual trigger for the expiry checker — useful for testing without waiting an hour
app.post('/api/admin/run-expiry-check', async (req, res) => {
  await runExpiryCheck();
  res.json({ success: true, message: 'Expiry check completed' });
});

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start server after DB connects ───────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });
  // Start the hourly expiry checker after DB is connected
  startExpiryChecker();
};

start();
