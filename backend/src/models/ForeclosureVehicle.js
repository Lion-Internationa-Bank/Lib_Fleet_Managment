// seen

import mongoose from "mongoose";

// models/ForeclosureVehicle.js
const ForeclosureSchema = new mongoose.Schema({
  plate_no: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  property_owner: String,
  lender_branch: String,
  parking_place: String,
  date_into: Date,
  date_out: Date,
}, { timestamps: true });

ForeclosureSchema.index({ date_in: 1 });
ForeclosureSchema.index({ date_out: 1 });

export default mongoose.model('ForeclosureVehicle',ForeclosureSchema)