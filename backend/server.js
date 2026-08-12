
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { PORT } = require('./src/config/env');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
