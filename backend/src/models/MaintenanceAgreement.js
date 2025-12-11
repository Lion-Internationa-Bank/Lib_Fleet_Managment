// seen
// MaintenanceAgreement.js
const AgreementSchema = new mongoose.Schema({
  service_provider: String,
  contract_renewal_date: Date,
  contract_expiry_date: Date,
  new_contract_date: Date,     // auto = expiry - 5 days
}, { timestamps: true });