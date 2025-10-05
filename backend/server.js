const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config({ path: './config.env' });

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients or same-origin
    if (!origin) return callback(null, true);

    // In production, restrict to configured CLIENT_URL
    if (process.env.NODE_ENV === 'production') {
      return allowedOrigins.includes(origin)
        ? callback(null, true)
        : callback(new Error('Not allowed by CORS'));
    }

    // In development, allow common localhost patterns
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    if (allowedOrigins.includes(origin) || isLocalhost) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Todo API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
}); 