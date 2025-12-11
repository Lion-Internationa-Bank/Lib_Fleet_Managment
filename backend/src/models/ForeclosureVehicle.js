// seen
// ForeclosureVehicle.js
const ForeclosureSchema = new mongoose.Schema({
  plate_no: { type: String, unique: true },
  property_owner: String,
  lender_branch: String,
  parking_place: String,
  date_into: Date,
  date_out: Date,
}, { timestamps: true });