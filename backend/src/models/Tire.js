//under reveiw to be filled 
const TireSchema = new mongoose.Schema({
  plate_no: { type: String, ref: 'Vehicle', required: true },
  make: String,
  serial_no: String,
  install_date: Date,
  current_km_at_install: Number,
  predefined_km_limit: { type: Number, default: 40000 },
  last_service_date: Date,
  next_service_date: Date,     // Reminder needed
  performance: Number,         // auto %
}, { timestamps: true });

TireSchema.index({ next_service_date: 1 });
export default mongoose.model('Tire', TireSchema);