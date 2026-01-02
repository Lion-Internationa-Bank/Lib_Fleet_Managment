// backend/server.js
import 'dotenv/config';
import './src/config/database.js'; // Connect DB first
import app from './src/app.js';
import { createServer } from 'http';
import syncReminders from './src/jobs/reminderSync.js';
// import { setupWebSocket } from './src/utils/websocket.js'; // optional real-time

const PORT = process.env.PORT || 5000;

// Use HTTP server for better for WebSocket, clustering, etc.
// const server = createServer(app);

// Optional: Real-time notifications (service due, reminders)
// setupWebSocket?.(server);

// server.listen(PORT, () => {
    app.listen(PORT, () => {
  console.log(`LIB FMS Backend running on PORT ${PORT}`);
  console.log(`http://localhost:${PORT}`);

  // Run reminder sync immediately on startup
  syncReminders();

  // Optional: log next run
  console.log('Reminder sync scheduled daily at 11:30 PM EAT');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});