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

    vehicle_type: { type: String, required: true, trim: true },
    invoice_no: { type: String, required: true, trim: true, uppercase: true },
    location: { type: String, required: true, trim: true },

    workshop_name: String,

    maintenance_type: {
      type: String,
      enum: ['Preventive', 'Corrective', 'Breakdown', 'Body & Paint'],
      required: true,
    },

    labour_cost: { type: Number, default: 0, min: 0 },

    spare_cost: { type: Number, default: 0 },
    total_cost: { type: Number, default: 0 },

    km_diff: { type: Number, default: null },
    cost_per_km: { type: Number, default: null },

    costed_by: String,

    replaced_spare_part: [
      {
        part: { type: String, required: true },
        cost: { type: Number, required: true, min: 0 },
      },
    ],

    km_at_service: { type: Number, required: true, min: 0 },
    date_in: Date,
    date_out: Date,
    remark: String,
  },
  { timestamps: true }
);

VehicleMaintenanceSchema.index({ plate_no: 1, date_out: -1 });

// Recalculate spare_cost and total_cost
const calculateCosts = function () {
  const partsTotal =
    this.replaced_spare_part?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;

  this.spare_cost = Number(partsTotal.toFixed(2));
  this.total_cost = Number((this.labour_cost + this.spare_cost).toFixed(2));
};

VehicleMaintenanceSchema.pre('save', async function () {
  // 1. Recalculate costs for current record
  calculateCosts.call(this);

  // 2. Current (newest) record always has null values
  this.km_diff = null;
  this.cost_per_km = null;

  // 3. Determine date to compare against
  const compareDate = this.date_out || this.date_in || new Date();

  // 4. Find the most recent previous maintenance record
  const previous = await this.constructor
    .findOne({
      plate_no: this.plate_no,
      _id: { $ne: this._id },
      date_out: { $lt: compareDate },
    })
    .sort({ date_out: -1 })
    .lean();

  // 5. Update previous record if exists
  if (previous && previous.km_at_service != null) {
    const kmDiff = this.km_at_service - previous.km_at_service;

    if (kmDiff > 0) {
      // Safely recalculate previous total_cost
      const prevPartsTotal =
        previous.replaced_spare_part?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;
      const prevTotalCost = Number((previous.labour_cost + prevPartsTotal).toFixed(2));

      await this.constructor.updateOne(
        { _id: previous._id },
        {
          $set: {
            km_diff: kmDiff,
            cost_per_km: Number((prevTotalCost / kmDiff).toFixed(4)),
          },
        }
      );
    } else {
      // km not increased or rolled back
      await this.constructor.updateOne(
        { _id: previous._id },
        { $set: { km_diff: null, cost_per_km: null } }
      );
    }
  }
});

export default mongoose.model('VehicleMaintenance', VehicleMaintenanceSchema);