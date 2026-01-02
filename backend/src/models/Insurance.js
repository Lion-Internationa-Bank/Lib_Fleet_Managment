import mongoose from "mongoose";

const InsuranceSchema = new mongoose.Schema(
  {
    insurance_provider: {
      type: String,
      required: true,
      trim: true,
    },
    insurance_renewal_date: {
      type: Date,
      required: true,
    },
    insurance_expired_date: {
      type: Date,
      required: true,
    },
    reminder_date: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Auto-calculate reminder_date = expiry_date - 5 days
InsuranceSchema.pre("save", function () {
  if (this.insurance_expired_date && !this.isModified("reminder_date")) {
    const expiry = new Date(this.insurance_expired_date);
    this.reminder_date = new Date(expiry.setDate(expiry.getDate() - 5));
  }
 
});

export default mongoose.model("Insurance", InsuranceSchema);