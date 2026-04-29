import cron from 'node-cron';
import Vehicle from '../models/Vehicle.js';
import Generator from '../models/Generator.js';
import Insurance from '../models/Insurance.js';
import MaintenanceAgreement from '../models/MaintenanceAgreement.js';
import ActiveReminder from '../models/ActiveReminder.js';
import reminderConfig from '../config/reminder.config.js';

// Track if job is running to prevent overlaps
let isRunning = false;
let cronJob = null;

// Logger with levels
const logger = {
  debug: (...args) => {
    if (['debug'].includes(reminderConfig.logLevel)) {
      console.log('🔍 [DEBUG]', ...args);
    }
  },
  info: (...args) => {
    if (['debug', 'info'].includes(reminderConfig.logLevel)) {
      console.log('ℹ️ [INFO]', ...args);
    }
  },
  warn: (...args) => {
    if (['debug', 'info', 'warn'].includes(reminderConfig.logLevel)) {
      console.warn('⚠️ [WARN]', ...args);
    }
  },
  error: (...args) => {
    console.error('❌ [ERROR]', ...args);
  },
  success: (...args) => {
    if (['debug', 'info', 'warn'].includes(reminderConfig.logLevel)) {
      console.log('✅ [SUCCESS]', ...args);
    }
  }
};

// Helper: Calculate days left accurately
const getDaysLeft = (futureDate, today) => {
  const diffTime = futureDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper: Determine urgency based on configurable thresholds
const getUrgency = (daysLeft) => {
  const { critical, warning } = reminderConfig.urgencyThresholds;
  
  if (daysLeft < 0) return 'Critical';
  if (daysLeft <= critical) return 'Critical';
  if (daysLeft <= warning) return 'Warning';
  return 'Info';
};

// NEW: Calculate next service hour based on 200-hour intervals
const getNextServiceHour = (currentHourMeter) => {
  // Find the next multiple of 200
  const nextMultiple = Math.ceil(currentHourMeter / 200) * 200;
  return nextMultiple;
};

// NEW: Calculate hours remaining until next service
const getHoursRemaining = (currentHourMeter, nextServiceHour) => {
  return nextServiceHour - currentHourMeter;
};

// NEW: Determine urgency based on hours remaining for generator
const getGeneratorUrgency = (hoursRemaining) => {
  const { generatorHourThresholds } = reminderConfig;
  
  if (hoursRemaining <= 0) return 'Critical';
  if (hoursRemaining <= generatorHourThresholds.critical) return 'Critical';
  if (hoursRemaining <= generatorHourThresholds.warning) return 'Warning';
  return 'Info';
};

// Main sync function
const syncReminders = async (isScheduledRun = false) => {
  // Prevent multiple simultaneous runs
  if (isRunning) {
    logger.warn('Reminder sync already running, skipping this execution');
    return;
  }

  if (!reminderConfig.enabled) {
    logger.info('Reminder sync is disabled in config');
    return;
  }

  isRunning = true;
  const startTime = Date.now();
  
  logger.info(`🔄 Starting reminder sync... ${isScheduledRun ? '(scheduled)' : '(manual)'}`);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight

  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + reminderConfig.reminderWindowDays);

  const reminderBuffer = [];
  const errors = [];

  // Cleanup old reminders if enabled
  if (reminderConfig.cleanupExpired) {
    try {
      const deleted = await ActiveReminder.deleteMany({
        due_date: { $lt: today }
      });
      if (deleted.deletedCount > 0) {
        logger.info(`🧹 Cleaned up ${deleted.deletedCount} expired reminders`);
      }
    } catch (error) {
      logger.warn('Failed to cleanup old reminders:', error.message);
      errors.push('Cleanup failed');
    }
  }

  try {
    // === 1. VEHICLES (BOLO + Service) ===
    logger.debug('Fetching vehicle reminders...');
    const vehicles = await Vehicle.find({
      $or: [
        { bolo_expired_date: { $gte: today, $lte: thirtyDaysFromNow } },
        { next_service_date: { $gte: today, $lte: thirtyDaysFromNow } },
      ],
    }).lean();

    for (const v of vehicles) {
      // BOLO Reminder
      if (v.bolo_expired_date) {
        const daysLeft = getDaysLeft(v.bolo_expired_date, today);
        if (daysLeft >= 0 && daysLeft <= reminderConfig.reminderWindowDays) {
          reminderBuffer.push({
            reminder_type: 'Bolo',
            title: `BOLO Expiry: ${v.plate_no}`,
            days_left: daysLeft,
            due_date: v.bolo_expired_date,
            urgency: getUrgency(daysLeft),
            metadata: {
              location: v.location || 'N/A',
              allocation: v.vehicle_allocation || 'N/A',
              identifier: v.plate_no,
            },
            related_id: v._id,
          });
        }
      }

      // Vehicle Service Reminder
      if (v.next_service_date) {
        const daysLeft = getDaysLeft(v.next_service_date, today);
        if (daysLeft >= 0 && daysLeft <= reminderConfig.reminderWindowDays) {
          reminderBuffer.push({
            reminder_type: 'Vehicle Maintenance',
            title: `Service Due: ${v.plate_no}`,
            days_left: daysLeft,
            due_date: v.next_service_date,
            urgency: getUrgency(daysLeft),
            metadata: {
              location: v.location || 'N/A',
              allocation: v.vehicle_allocation || 'N/A',
              identifier: v.plate_no,
            },
            related_id: v._id,
          });
        }
      }
    }
    logger.debug(`Found ${vehicles.length} vehicles with upcoming reminders`);
  } catch (error) {
    logger.warn('Vehicle reminders failed:', error.message);
    errors.push('Vehicle sync failed');
  }

  try {
    // === 2. GENERATORS (UPDATED: Hour meter based reminders) ===
    logger.debug('Fetching generator reminders...');
    
    // Get all active generators
    const generators = await Generator.find({}).lean();

    let generatorReminderCount = 0;

    for (const g of generators) {
      const currentHours = g.current_hour_meter || 0;
      const nextServiceHour = getNextServiceHour(currentHours);
      const hoursRemaining = getHoursRemaining(currentHours, nextServiceHour);
      
      // Check if hours remaining is 15 or less (warning threshold)
      // OR if next service hour is within the configured hour threshold
      const shouldCreateReminder = 
        hoursRemaining <= reminderConfig.generatorReminderHours || // Default: 15 hours
        (hoursRemaining > 0 && hoursRemaining <= reminderConfig.generatorReminderHours);
      
      if (shouldCreateReminder && hoursRemaining > 0) {
        // Estimate due date based on average daily usage (optional)
        // You can configure averageHoursPerDay in config
        let estimatedDueDate = new Date();
        if (reminderConfig.generatorAvgHoursPerDay && reminderConfig.generatorAvgHoursPerDay > 0) {
          const daysToService = Math.ceil(hoursRemaining / reminderConfig.generatorAvgHoursPerDay);
          estimatedDueDate.setDate(today.getDate() + daysToService);
        } else {
          // Default: add 30 days as placeholder
          estimatedDueDate.setDate(today.getDate() + 30);
        }
        
        const urgency = getGeneratorUrgency(hoursRemaining);
        
        reminderBuffer.push({
          reminder_type: 'Generator Maintenance',
          title: `Generator Service Due: ${g.serial_no}`,
          days_left: hoursRemaining, // Store hours remaining instead of days
          due_date: estimatedDueDate,
          urgency: urgency,
          metadata: {
            location: g.location || 'N/A',
            allocation: g.allocation || 'N/A',
            identifier: g.serial_no,
            current_hours: currentHours,
            next_service_hour: nextServiceHour,
            hours_remaining: hoursRemaining,
          },
          related_id: g._id,
        });
        
        generatorReminderCount++;
        
        // Log critical warnings
        if (urgency === 'Critical') {
          logger.warn(`⚠️ Generator ${g.serial_no} needs service in ${hoursRemaining} hours!`);
        } else if (urgency === 'Warning') {
          logger.info(`📢 Generator ${g.serial_no} service due in ${hoursRemaining} hours`);
        }
      }
      
      // Also keep date-based service reminder if next_service_date exists
      if (g.next_service_date) {
        const daysLeft = getDaysLeft(g.next_service_date, today);
        if (daysLeft >= 0 && daysLeft <= reminderConfig.reminderWindowDays) {
          // Check if we already have a reminder for this generator
          const existingReminder = reminderBuffer.find(
            r => r.related_id?.toString() === g._id.toString() && 
            r.reminder_type === 'Generator Maintenance'
          );
          
          if (!existingReminder) {
            reminderBuffer.push({
              reminder_type: 'Generator Maintenance',
              title: `Generator Date-Based Service: ${g.serial_no}`,
              days_left: daysLeft,
              due_date: g.next_service_date,
              urgency: getUrgency(daysLeft),
              metadata: {
                location: g.location || 'N/A',
                allocation: g.allocation || 'N/A',
                identifier: g.serial_no,
                current_hours: g.current_hour_meter || 0,
              },
              related_id: g._id,
            });
            generatorReminderCount++;
          }
        }
      }
    }
    
    logger.debug(`Found ${generatorReminderCount} generator reminders (hour-based threshold: ${reminderConfig.generatorReminderHours} hours)`);
  } catch (error) {
    logger.warn('Generator reminders failed:', error.message);
    errors.push('Generator sync failed');
  }

  try {
    // === 3. INSURANCE ===
    logger.debug('Fetching insurance reminders...');
    const insurances = await Insurance.find({
      reminder_date: { $gte: today, $lte: thirtyDaysFromNow },
    }).lean();

    for (const i of insurances) {
      const daysLeft = getDaysLeft(i.insurance_expired_date, today);
      reminderBuffer.push({
        reminder_type: 'Insurance',
        title: `Insurance Renewal: ${i.insurance_provider}`,
        days_left: daysLeft,
        due_date: i.insurance_expired_date,
        urgency: getUrgency(daysLeft),
        metadata: {
          provider: i.insurance_provider,
          identifier: i.insurance_provider,
          expiry: i.insurance_expired_date,
        },
        related_id: i._id,
      });
    }
    logger.debug(`Found ${insurances.length} insurance policies with upcoming renewal`);
  } catch (error) {
    logger.warn('Insurance reminders failed:', error.message);
    errors.push('Insurance sync failed');
  }

  try {
    // === 4. MAINTENANCE AGREEMENTS ===
    logger.debug('Fetching maintenance agreement reminders...');
    const agreements = await MaintenanceAgreement.find({
      new_contract_date: { $gte: today, $lte: thirtyDaysFromNow },
    }).lean();

    for (const a of agreements) {
      const daysLeft = getDaysLeft(a.contract_expiry_date, today);
      reminderBuffer.push({
        reminder_type: 'Maintenance Agreement',
        title: `Contract Renewal: ${a.service_provider}`,
        days_left: daysLeft,
        due_date: a.new_contract_date,
        urgency: getUrgency(daysLeft),
        metadata: {
          provider: a.service_provider,
          identifier: a.service_provider,
          expiry: a.contract_expiry_date,
        },
        related_id: a._id,
      });
    }
    logger.debug(`Found ${agreements.length} agreements with upcoming renewal`);
  } catch (error) {
    logger.warn('Agreement reminders failed:', error.message);
    errors.push('Agreement sync failed');
  }

  // === 5. UPSERT ALL REMINDERS ===
  if (reminderBuffer.length > 0) {
    try {
      const bulkOps = reminderBuffer.map(reminder => ({
        updateOne: {
          filter: {
            related_id: reminder.related_id,
            reminder_type: reminder.reminder_type,
          },
          update: { $set: reminder },
          upsert: true,
        },
      }));

      const result = await ActiveReminder.bulkWrite(bulkOps);
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.success(
        `Synced ${reminderBuffer.length} reminders in ${duration}s ` +
        `(${result.upsertedCount} new, ${result.modifiedCount} updated)`
      );

      // Log summary by urgency
      const critical = reminderBuffer.filter(r => r.urgency === 'Critical').length;
      const warning = reminderBuffer.filter(r => r.urgency === 'Warning').length;
      const info = reminderBuffer.filter(r => r.urgency === 'Info').length;
      logger.info(`📊 Summary: ${critical} Critical, ${warning} Warning, ${info} Info`);
      
    } catch (error) {
      logger.error('Bulk write failed:', error);
      errors.push('Bulk write failed');
    }
  } else {
    logger.info('ℹ️ No active reminders in the next 30 days');
  }

  // Final status
  if (errors.length === 0) {
    logger.success('Reminder sync completed successfully');
  } else {
    logger.warn(`Reminder sync completed with ${errors.length} errors:`, errors);
  }

  isRunning = false;
};

// Initialize and start the cron job
export const startReminderSync = () => {
  if (!reminderConfig.enabled) {
    logger.info('Reminder sync is disabled. Not starting cron job.');
    return;
  }

  // Stop existing cron job if any
  if (cronJob) {
    cronJob.stop();
    logger.info('Stopped existing reminder cron job');
  }

  // Schedule the cron job
  try {
    cronJob = cron.schedule(
      reminderConfig.schedule,
      () => syncReminders(true), // Pass true to indicate scheduled run
      {
        scheduled: true,
        timezone: reminderConfig.timezone,
      }
    );
    
    logger.info(`📅 Reminder sync scheduled: ${reminderConfig.schedule} (${reminderConfig.timezone})`);
  } catch (error) {
    logger.error('Failed to schedule cron job:', error);
  }

  // Run on startup if configured
  if (reminderConfig.runOnStartup) {
    logger.info(`🚀 Running initial reminder sync (delay: ${reminderConfig.startupDelay}ms)`);
    setTimeout(() => syncReminders(false), reminderConfig.startupDelay);
  }
};

// Stop the cron job (useful for graceful shutdown)
export const stopReminderSync = () => {
  if (cronJob) {
    cronJob.stop();
    logger.info('Stopped reminder cron job');
    cronJob = null;
  }
};

// Manual trigger function (can be called from API if needed)
export const triggerReminderSync = async () => {
  return syncReminders(false);
};

// Export the main function for backward compatibility
export default syncReminders;