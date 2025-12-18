// seen
// GeneratorService.js
import mongoose from "mongoose";
const GeneratorServiceSchema = new mongoose.Schema({
  generatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Generator' },
  allocation: String,
  hour_meter_reading: Number,
  next_service_hour: Number,
  maintenance_type: String,
  description: String,
  service_provider: String,                                                             
  service_date: Date,
  cost: Number,
  status: String,
}, { timestamps: true });

export default mongoose.model('GeneratorService', GeneratorServiceSchema);