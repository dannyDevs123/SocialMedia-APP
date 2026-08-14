const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const { corsOptions } = require('./config/cors');
const { apiLimiter } = require('./middleware/rateLimiter');
const ensureUtf8JsonResponse = require('./middleware/utf8Response');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

app.get('/api/ping', (req, res) => {
  res.status(200).send('OK');
});

// Temporary debug route to verify Render's forwarded client IP handling.
app.get('/api/debug/ip', (req, res) => {
  res.json({ clientIp: req.ip, headers: req.headers['x-forwarded-for'] });
});

// Helmet defaults block cross-origin <img> loads via Cross-Origin-Resource-Policy.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS must allow the Vercel frontend origin and local dev origins.
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limiting
app.use('/api/', apiLimiter);

// Body parser (Node parses request bodies as UTF-8 by default)
app.use(express.json({ limit: '10mb', type: 'application/json' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Declare UTF-8 on all JSON responses
app.use('/api', ensureUtf8JsonResponse);

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Serve uploaded avatars with headers that allow cross-origin embedding from the frontend.
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    setHeaders(res) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    },
  })
);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/posts/:postId/comments', require('./routes/commentRoutes'));
app.use('/api/posts/:postId/like', require('./routes/likeRoutes'));
app.use('/api/users', require('./routes/followRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
