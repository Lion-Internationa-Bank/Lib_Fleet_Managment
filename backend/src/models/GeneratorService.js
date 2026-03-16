import mongoose from "mongoose";

const GeneratorServiceSchema = new mongoose.Schema({
  generatorSerialNo: { 
    type: String, 
    ref: 'Generator',
    required: true,
    uppercase: true,
    trim: true 
  },
  allocation: String,
  hour_meter_reading: {
    type: Number,
    required: true,
    min: 0
  },
  next_service_hour: {
    type: Number,
    required: true,
    min: 0
  },
  maintenance_type: {
    type: String,
    enum: ['Preventive', 'Corrective', 'Breakdown', 'Body & Paint'],
    required: true,
  },
  description: String,
  service_provider: {
    type: String,
    required: true
  },
  service_date: {
    type: Date,
    required: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true
  },
}, { timestamps: true });

// Index for efficient querying
GeneratorServiceSchema.index({ generatorSerialNo: 1, service_date: -1 });

export default mongoose.model('GeneratorService', GeneratorServiceSchema);