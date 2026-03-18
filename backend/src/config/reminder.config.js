// src/config/reminder.config.js
export const reminderConfig = {
  // Enable/disable reminder sync completely
  enabled: true,
  
  // Run on server startup
  runOnStartup: true,
  
  // Delay before first run (ms) - to ensure DB connection is ready
  startupDelay: 5000,
  
  // Cron schedule (default: 11:30 PM every day)
  // Format: minute hour day-of-month month day-of-week
  schedule: '30 23 * * *',
  
  // Timezone for cron job
  timezone: 'Africa/Addis_Ababa', // EAT
  
  // How many days ahead to check for reminders
  reminderWindowDays: 30,
  
  // Urgency thresholds (days)
  urgencyThresholds: {
    critical: 3,    // <= 3 days = Critical
    warning: 7,     // <= 7 days = Warning
    // > 7 days = Info
  },
  
  // Logging level: 'debug', 'info', 'warn', 'error'
  logLevel: 'info',
  
  // Cleanup old reminders
  cleanupExpired: true,
};

// Environment variable overrides
if (process.env.REMINDER_ENABLED !== undefined) {
  reminderConfig.enabled = process.env.REMINDER_ENABLED === 'true';
}

if (process.env.REMINDER_SCHEDULE) {
  reminderConfig.schedule = process.env.REMINDER_SCHEDULE;
}

if (process.env.REMINDER_TIMEZONE) {
  reminderConfig.timezone = process.env.REMINDER_TIMEZONE;
}

if (process.env.REMINDER_WINDOW_DAYS) {
  reminderConfig.reminderWindowDays = parseInt(process.env.REMINDER_WINDOW_DAYS, 10);
}

export default reminderConfig;