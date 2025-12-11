// seen  found 1 current hour meter
// Generator.js
const GeneratorSchema = new mongoose.Schema({
  location: String,
  allocation: String,
  capacity: Number,
  engine_brand: String,
  serial_no: { type: String, unique: true },
  acquisition_cost: Number,
  acquisition_date: Date,
  current_hour_meter: { type: Number, default: 0 },
  last_service_date: Date,
  next_service_date: Date,   // Reminder 1 year
   status: String,
}, { timestamps: true });

GeneratorSchema.index({ next_service_date: 1 });
export default mongoose.model('Generator', GeneratorSchema);