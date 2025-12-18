// models/MaintenanceAgreement.js
import mongoose from 'mongoose';

const AgreementSchema = new mongoose.Schema({
  service_provider: { type: String, required: true },
  contract_renewal_date: { type: Date, required: true },
  contract_expiry_date: { type: Date, required: true },
  new_contract_date: { type: Date }, // auto-calculated
}, { timestamps: true });

// Auto-set new_contract_date = contract_expiry_date - 5 days
AgreementSchema.pre('save', function () {
  if (this.contract_expiry_date && !this.new_contract_date) {
    const expiry = new Date(this.contract_expiry_date);
    this.new_contract_date = new Date(expiry.setDate(expiry.getDate() - 5));
  }
});

export default mongoose.model('MaintenanceAgreement', AgreementSchema);