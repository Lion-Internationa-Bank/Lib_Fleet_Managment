//seen
// models/VehicleMaintenance.js
import mongoose from 'mongoose';

const VehicleMaintenanceSchema = new mongoose.Schema(
  {
    plate_no: {
      type: String,
      ref: 'Vehicle',
      required: true,
      uppercase: true,
      trim: true,
    },
    workshop_name: String,

    maintenance_type: {
      type: String,
      enum: ['Preventive', 'Corrective', 'Breakdown', 'Body & Paint'],
      required: true,
    },

    labour_cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    // THIS IS AUTO-CALCULATED → NEVER SEND FROM FRONTEND
    spare_cost: {
      type: Number,
      default: 0,
    },

    // THIS IS FINAL TOTAL → AUTO-CALCULATED
    total_cost: {
      type: Number,
      default: 0,
    },

    costed_by: String,

    // USER FILLS THIS ARRAY ONLY
    replaced_spare_part: [
      {
        part: { type: String, required: true },
        cost: { type: Number, required: true, min: 0 },
      },
    ],

    current_km: Number,
    date_in: Date,
    date_out: Date,
    remark: String,
  },
  { timestamps: true }
);

// Indexes
VehicleMaintenanceSchema.index({ plate_no: 1, date_out: -1 });

const calculateCosts = function () {
  // Sum all spare parts
  const partsTotal =
    this.replaced_spare_part?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;

  // spare_cost = sum of parts only
  this.spare_cost = Number(partsTotal.toFixed(2));

  // total_cost = labour + parts
  this.total_cost = Number(((this.labour_cost || 0) + this.spare_cost).toFixed(2));
};

// Run on create & update (save)
VehicleMaintenanceSchema.pre('save', function (next) {
  calculateCosts.call(this);
  next();
});

// Run on findOneAndUpdate, updateOne, etc.
VehicleMaintenanceSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
  const update = this.getUpdate();

  // If replaced_spare_part or labour_cost is being modified → recalculate
  if (
    update.replaced_spare_part ||
    update.labour_cost ||
    update.$set?.replaced_spare_part ||
    update.$set?.labour_cost ||
    update.$push?.replaced_spare_part ||
    update.$pull?.replaced_spare_part
  ) {
    // Get current document or updated values
    const docToUpdate = update.$set || update;

    const parts = docToUpdate.replaced_spare_part || this.replaced_spare_part || [];
    const partsTotal = parts.reduce((sum, item) => sum + (item.cost || 0), 0);
    const labour = docToUpdate.labour_cost ?? this.labour_cost ?? 0;

    this.set({
      spare_cost: Number(partsTotal.toFixed(2)),
      total_cost: Number((labour + partsTotal).toFixed(2)),
    });
  }
  next();
});

export default mongoose.model('VehicleMaintenance', VehicleMaintenanceSchema);