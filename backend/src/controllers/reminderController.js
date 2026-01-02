// backend/src/controllers/reminderController.js
import ActiveReminder from '../models/ActiveReminder.js';

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getActiveReminders = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50, type } = req.query;

  const filter = {};
  if (type) filter.reminder_type = type;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Get all active reminders, sorted by urgency (days_left)
  const reminders = await ActiveReminder.find(filter)
    .sort({ days_left: 1, due_date: 1 }) // Most urgent first
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await ActiveReminder.countDocuments(filter);

  // Group by reminder_type for frontend convenience
  const grouped = reminders.reduce((acc, reminder) => {
    const type = reminder.reminder_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(reminder);
    return acc;
  }, {});

  // Also sort groups by urgency (e.g., Critical items first)
  const sortedGroups = Object.keys(grouped)
    .map(key => ({
      type: key,
      count: grouped[key].length,
      reminders: grouped[key],
    }))
    .sort((a, b) => {
      // Put types with critical items first
      const aCritical = a.reminders.some(r => r.days_left <= 3);
      const bCritical = b.reminders.some(r => r.days_left <= 3);
      return bCritical - aCritical || a.type.localeCompare(b.type);
    });

  res.status(200).json({
    success: true,
    total,
    count: reminders.length,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
    data: {
      grouped: sortedGroups,
      flat: reminders, // fallback if frontend wants flat list
    },
  });
});