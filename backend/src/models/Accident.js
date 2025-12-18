//seen
import mongoose from "mongoose";
const AccidentSchema = new mongoose.Schema({
  plate_no: { type: String, ref: 'Vehicle', required: true },
  accident_date: Date,
  accident_place: String,
  driver_name: String,
  damaged_part: String,
  
  accident_intensity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },                                               
  date_notified_insurance: Date,
  date_police_report: Date,
  date_insurance_surveyor: Date,
  date_auction: Date,
  date_into_garage: Date,
  date_out_garage: Date,
  current_situation: String,
  responsible_for_accident: { type: String, enum: ['3rd Party', 'Bank'] },
  risk_base_price: Number,
  old_age_contribution: Number,
  total: Number,
  action_taken: String,
}, { timestamps: true });

export default mongoose.model('Accident', AccidentSchema);