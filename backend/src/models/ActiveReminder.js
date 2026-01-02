// models/ActiveReminder.js
import mongoose from 'mongoose';

const ActiveReminderSchema = new mongoose.Schema({
  reminder_type: {
    type: String,
    required: true,
    enum: [
      'Bolo',
      'Vehicle Maintenance',
      'Generator Maintenance',
      'Insurance',
      'Maintenance Agreement',
    ],
  },
  title: { type: String, required: true },
  days_left: { type: Number, required: true }, // Real days remaining
  due_date: { type: Date, required: true },

  metadata: {
    location: String,
    allocation: String,
    identifier: String,     // plate_no, serial_no, provider
    provider: String,       // for agreements/insurance
    expiry: Date,           // actual expiry date
  },

  related_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  // Optional: urgency level for frontend highlighting
  urgency: {
    type: String,
    enum: ['Critical', 'Warning', 'Info'],
    default: 'Warning',
  },
}, { timestamps: true });

// Indexes for fast dashboard queries
ActiveReminderSchema.index({ reminder_type: 1 });
ActiveReminderSchema.index({ days_left: 1 });           // Most urgent first
ActiveReminderSchema.index({ due_date: 1 });
ActiveReminderSchema.index({ related_id: 1, reminder_type: 1 }, { unique: true }); // Prevent duplicates

export default mongoose.model('ActiveReminder', ActiveReminderSchema);