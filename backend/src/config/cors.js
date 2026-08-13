const { CLIENT_URL } = require('./env');

// Production + local dev origins. Override or extend via ALLOWED_ORIGINS on Render.
const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://social-media-app-frontend-pi.vercel.app',
];

const getAllowedOrigins = () => {
  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];

  return [...new Set([CLIENT_URL, ...DEFAULT_ORIGINS, ...envOrigins].filter(Boolean))];
};

const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    // Allow server-to-server tools and same-origin navigation without an Origin header.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = { corsOptions, getAllowedOrigins };
