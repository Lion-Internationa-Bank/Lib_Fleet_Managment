// jobs/reminderSync.js
import cron from 'node-cron';
import Vehicle from '../models/Vehicle.js';
import Generator from '../models/Generator.js';
import Insurance from '../models/Insurance.js';
import MaintenanceAgreement from '../models/MaintenanceAgreement.js';
import ActiveReminder from '../models/ActiveReminder.js';

const syncReminders = async () => {
  console.log('🔄 Starting daily reminder sync...');

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight

  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const reminderBuffer = [];
  const errors = [];

  // Helper: Calculate days left accurately
  const getDaysLeft = (futureDate) => {
    const diffTime = futureDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper: Determine urgency
  const getUrgency = (daysLeft) => {
    if (daysLeft < 0) return 'Critical';
    if (daysLeft <= 3) return 'Critical';
    if (daysLeft <= 7) return 'Warning';
    return 'Info';
  };

  // Cleanup old reminders first
  try {
    const deleted = await ActiveReminder.deleteMany({
      due_date: { $lt: today }
    });
    if (deleted.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deleted.deletedCount} expired reminders`);
    }
  } catch (error) {
    console.warn('⚠️ Failed to cleanup old reminders:', error.message);
    errors.push('Cleanup failed');
  }

  try {
    // === 1. VEHICLES (BOLO + Service) ===
    const vehicles = await Vehicle.find({
      $or: [
        { bolo_expired_date: { $gte: today, $lte: thirtyDaysFromNow } },
        { next_service_date: { $gte: today, $lte: thirtyDaysFromNow } },
      ],
    }).lean();

    for (const v of vehicles) {
      // BOLO Reminder
      if (v.bolo_expired_date) {
        const daysLeft = getDaysLeft(v.bolo_expired_date);
        if (daysLeft >= 0 && daysLeft <= 30) {
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
        const daysLeft = getDaysLeft(v.next_service_date);
        if (daysLeft >= 0 && daysLeft <= 30) {
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
  } catch (error) {
    console.warn('⚠️ Vehicle reminders failed:', error.message);
    errors.push('Vehicle sync failed');
  }

  try {
    // === 2. GENERATORS ===
    const generators = await Generator.find({
      next_service_date: { $gte: today, $lte: thirtyDaysFromNow },
    }).lean();

    for (const g of generators) {
      const daysLeft = getDaysLeft(g.next_service_date);
      if (daysLeft >= 0 && daysLeft <= 30) {
        reminderBuffer.push({
          reminder_type: 'Generator Maintenance',
          title: `Generator Service: ${g.serial_no}`,
          days_left: daysLeft,
          due_date: g.next_service_date,
          urgency: getUrgency(daysLeft),
          metadata: {
            location: g.location || 'N/A',
            allocation: g.allocation || 'N/A',
            identifier: g.serial_no,
          },
          related_id: g._id,
        });
      }
    }
  } catch (error) {
    console.warn('⚠️ Generator reminders failed:', error.message);
    errors.push('Generator sync failed');
  }

  try {
    // === 3. INSURANCE ===
    const insurances = await Insurance.find({
      reminder_date: { $gte: today, $lte: thirtyDaysFromNow },
    }).lean();

    for (const i of insurances) {
      const daysLeft = getDaysLeft(i.insurance_expired_date);
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
  } catch (error) {
    console.warn('⚠️ Insurance reminders failed:', error.message);
    errors.push('Insurance sync failed');
  }

  try {
    // === 4. MAINTENANCE AGREEMENTS ===
    const agreements = await MaintenanceAgreement.find({
      new_contract_date: { $gte: today, $lte: thirtyDaysFromNow },
    }).lean();

    for (const a of agreements) {
      const daysLeft = getDaysLeft(a.contract_expiry_date);
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
  } catch (error) {
    console.warn('⚠️ Agreement reminders failed:', error.message);
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
      console.log(
        `✅ Synced ${reminderBuffer.length} reminders ` +
        `(${result.upsertedCount} new, ${result.modifiedCount} updated)`
      );

      // Log summary by urgency
      const critical = reminderBuffer.filter(r => r.urgency === 'Critical').length;
      const warning = reminderBuffer.filter(r => r.urgency === 'Warning').length;
      const info = reminderBuffer.filter(r => r.urgency === 'Info').length;
      console.log(`📊 Summary: ${critical} Critical, ${warning} Warning, ${info} Info`);
      
    } catch (error) {
      console.error('❌ Bulk write failed:', error);
      errors.push('Bulk write failed');
    }
  } else {
    console.log('ℹ️ No active reminders in the next 30 days');
  }

  // Final status
  if (errors.length === 0) {
    console.log('✅ Reminder sync completed successfully');
  } else {
    console.warn(`⚠️ Reminder sync completed with ${errors.length} errors:`, errors);
  }
};

// Run every day at 11:30 PM
cron.schedule('30 23 * * *', syncReminders);

// Run on startup (with slight delay to ensure DB connection)
setTimeout(syncReminders, 5000);

export default syncReminders;