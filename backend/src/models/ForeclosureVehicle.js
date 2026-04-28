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
  property_owner:{type: String,
                  required:true
                 },
  lender_branch: {type: String,
                  required:true
                 },
  parking_place: {type: String,
                  required:true
                 },
  nearby_branch: {type: String,
                  required:true
                 },
  classification:{type:String,
    required:true,
    enum:["heavy","small"]
  },
  date_into: Date,
  date_out: Date,
}, { timestamps: true });

ForeclosureSchema.index({ date_in: 1 });
ForeclosureSchema.index({ date_out: 1 });

export default mongoose.model('ForeclosureVehicle',ForeclosureSchema)