//seen  found service related field
// models/Vehicle.js
import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  plate_no: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  location: { type: String, required: true },
  vehicle_allocation: { type: String, required: true },
  vehicle_type: { type: String, required: true },
  body_color: { type: String, required: true },
  manufacturing_year: { type: Number, required: true },
  vehicle_origin: { type: String, required: true },
  title_certificate_no: String,
  vehicle_model: { type: String, required: true },
  chassis_no: { type: String, required: true },
  engine_no: { type: String, required: true },
  seating_capacity: { type: Number, required: true },
  pay_load: Number,
  total_weight: Number,
  horse_power: Number,
  no_of_cylinder: Number,
  cc: Number,
  drive_type: String,
    fuel_type: {
      type: String,
      required: true,
      enum: ['Diesel', 'Regular', 'Octane'],
    },
  tyre_size: { type: String, required: true },
  original_price: Number,
  total_price: Number,
  delivery_date: Date,
  bolo_expired_date: { type: Date, required: true },
  supplier_company: String,
   
  // Auto-managed fields
  current_km: { type: Number, default: 0 },
  last_service_date: Date,
  next_service_date: Date,    // Reminder based on this
  file_uploads: [String],     // array of file URLs

}, { timestamps: true });

// Indexes for reminders & reports
VehicleSchema.index({ next_service_date: 1 });
VehicleSchema.index({ bolo_expired_date: 1 });
VehicleSchema.index({ location: 1 });

export default mongoose.model('Vehicle', VehicleSchema);
