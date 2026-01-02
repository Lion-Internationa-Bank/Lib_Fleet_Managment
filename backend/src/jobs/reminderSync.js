// jobs/reminderSync.js
import cron from 'node-cron';
import Vehicle from '../models/Vehicle.js';
import Generator from '../models/Generator.js';
import Insurance from '../models/Insurance.js';
import MaintenanceAgreement from '../models/MaintenanceAgreement.js'; // ← NEW
import ActiveReminder from '../models/ActiveReminder.js';

const syncReminders = async () => {
  console.log('🔄 Starting daily reminder sync...');

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight EAT

  const reminderBuffer = [];

  try {
    // === 1. VEHICLES (BOLO + Service) ===
    const vehicles = await Vehicle.find({
      $or: [
        { bolo_expired_date: { $gte: today } },
        { next_service_date: { $gte: today } },
      ],
    }).lean();

    for (const v of vehicles) {
      // BOLO Reminder
      if (v.bolo_expired_date) {
        const daysLeft = Math.ceil((v.bolo_expired_date - today) / (24 * 60 * 60 * 1000));
        if (daysLeft >= 1 && daysLeft <= 30) {
          reminderBuffer.push({
            reminder_type: 'Bolo',
            title: `BOLO Expiry: ${v.plate_no}${daysLeft <= 3 ? ' ⚠️ URGENT' : ''}`,
            days_left: daysLeft,
            due_date: v.bolo_expired_date,
            metadata: {
              location: v.location,
              allocation: v.vehicle_allocation,
              identifier: v.plate_no,
            },
            related_id: v._id,
          });
        }
      }

      // Vehicle Service Reminder
      if (v.next_service_date) {
        const daysLeft = Math.ceil((v.next_service_date - today) / (24 * 60 * 60 * 1000));
        if (daysLeft >= 1 && daysLeft <= 30) {
          reminderBuffer.push({
            reminder_type: 'Vehicle Maintenance',
            title: `Service Due: ${v.plate_no}${daysLeft <= 3 ? ' ⚠️ URGENT' : ''}`,
            days_left: daysLeft,
            due_date: v.next_service_date,
            metadata: {
              location: v.location,
              allocation: v.vehicle_allocation,
              identifier: v.plate_no,
            },
            related_id: v._id,
          });
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ Vehicle reminders failed:', error.message);
  }

  try {
    // === 2. GENERATORS ===
    const generators = await Generator.find({
      next_service_date: { $gte: today },
    }).lean();

    for (const g of generators) {
      const daysLeft = Math.ceil((g.next_service_date - today) / (24 * 60 * 60 * 1000));
      if (daysLeft >= 1 && daysLeft <= 30) {
        reminderBuffer.push({
          reminder_type: 'Generator Maintenance',
          title: `Generator Service: ${g.serial_no}${daysLeft <= 3 ? ' ⚠️ URGENT' : ''}`,
          days_left: daysLeft,
          due_date: g.next_service_date,
          metadata: {
            location: g.location,
            allocation: g.allocation,
            identifier: g.serial_no,
          },
          related_id: g._id,
        });
      }
    }
  } catch (error) {
    console.warn('⚠️ Generator reminders failed:', error.message);
  }

  try {
    // === 3. INSURANCE ===
    const insurances = await Insurance.find({
      reminder_date: { $gte: today, $lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) },
    }).lean();

    for (const i of insurances) {
      const daysLeft = Math.ceil((i.reminder_date - today) / (24 * 60 * 60 * 1000));
      reminderBuffer.push({
        reminder_type: 'Insurance',
        title: `Insurance Renewal: ${i.insurance_provider}${daysLeft <= 3 ? ' ⚠️ URGENT' : ''}`,
        days_left: daysLeft,
        due_date: i.reminder_date,
        metadata: {
          identifier: i.insurance_provider,
          expiry: i.insurance_expired_date,
        },
        related_id: i._id,
      });
    }
  } catch (error) {
    console.warn('⚠️ Insurance reminders failed:', error.message);
  }

  try {
    // === 4. MAINTENANCE AGREEMENTS (NEW!) ===
    const agreements = await MaintenanceAgreement.find({
      new_contract_date: { $gte: today, $lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) },
    }).lean();

    for (const a of agreements) {
      const daysLeft = Math.ceil((a.new_contract_date - today) / (24 * 60 * 60 * 1000));
      reminderBuffer.push({
        reminder_type: 'Maintenance Agreement',
        title: `Contract Renewal: ${a.service_provider}${daysLeft <= 3 ? ' ⚠️ URGENT' : ''}`,
        days_left: daysLeft,
        due_date: a.new_contract_date,
        metadata: {
          provider: a.service_provider,
          expiry: a.contract_expiry_date,
        },
        related_id: a._id,
      });
    }
  } catch (error) {
    console.warn('⚠️ Agreement reminders failed:', error.message);
  }

  // === 5. UPSERT ALL REMINDERS (Safe, Fast, No Duplicates) ===
  if (reminderBuffer.length > 0) {
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
      `✅ Synced ${reminderBuffer.length} reminders (` +
      `${result.upsertedCount} new, ${result.modifiedCount} updated)`
    );
  } else {
    console.log('ℹ️ No active reminders in the next 30 days');
  }
};

// Run every day at 11:30 PM EAT
cron.schedule('30 23 * * *', syncReminders);

// Run immediately on server startup (so users see reminders right away)
syncReminders();

export default syncReminders;