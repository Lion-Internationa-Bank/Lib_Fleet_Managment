import 'dotenv/config';
import './src/config/database.js'; // Connect DB first
import app from './src/app.js';
import { createServer } from 'http';
import { startReminderSync, stopReminderSync } from './src/jobs/reminderSync.js';
// import { setupWebSocket } from './src/utils/websocket.js'; // optional real-time

const PORT = process.env.PORT || 5000;

// Use HTTP server for better for WebSocket, clustering, etc.
const server = createServer(app);

// Optional: Real-time notifications (service due, reminders)
// setupWebSocket?.(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`LIB FMS Backend running on PORT ${PORT}`);
  console.log(`http://localhost:${PORT}`);

  // Start the reminder sync job (handles both scheduling and initial run)
  startReminderSync();

  // Optional: log next run info
  console.log('Reminder sync configured. Check logs for schedule details.');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  stopReminderSync();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down...');
  stopReminderSync();
  server.close(() => {
    process.exit(0);
  });
});