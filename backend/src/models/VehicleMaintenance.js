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

    vehicle_type: {
      type: String,
      trim: true,
    },

    invoice_no: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    location: {
      type: String,
      trim: true,
    },

    workshop_name: {
      type: String,
      trim: true,
    },

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

    spare_cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    total_cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    km_diff: {
      type: Number,
      default: null,
    },

    cost_per_km: {
      type: Number,
      default: null,
    },

    costed_by: {
      type: String,
      trim: true,
    },

    spare_part: [
      {
        part: {
          type: String,
          required: true,
          trim: true,
        },

        service_type: {
          type: String,
          required: true,
          enum: [
            'replace',
            'clean',
            'repair',
            'inspect and clean',
            'inspect',
            'rotation',
            'lubricate and clean',
          ],
        },

        cost: {
          type: Number,
          required: true,
          min: 0,
        },

        service_provider: {
          type: String,
          required: true,
          trim: true,
        },

        inspected_by: {
          type: String,
          required: true,
          trim: true,
        },

        mileage: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    km_at_service: {
      type: Number,
      required: true,
      min: 0,
    },

    date_in: {
      type: Date,
    },

    date_out: {
      type: Date,
    },

    remark: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

VehicleMaintenanceSchema.index({ plate_no: 1, date_out: -1 });

/* -------------------- COST CALCULATION -------------------- */
const calculateCosts = function () {
  const partsTotal =
    this.spare_part?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;

  this.spare_cost = Number(partsTotal.toFixed(2));
  this.total_cost = Number((this.labour_cost + this.spare_cost).toFixed(2));
};

/* -------------------- PRE SAVE HOOK -------------------- */
VehicleMaintenanceSchema.pre('save', async function () {
  // 1. Calculate current costs
  calculateCosts.call(this);

  // 2. Current record should not have km_diff & cost_per_km
  this.km_diff = null;
  this.cost_per_km = null;

  // 3. Determine comparison date
  const compareDate = this.date_out || this.date_in || new Date();

  // 4. Find previous maintenance
  const previous = await this.constructor
    .findOne({
      plate_no: this.plate_no,
      _id: { $ne: this._id },
      date_out: { $lt: compareDate },
    })
    .sort({ date_out: -1 })
    .lean();

  // 5. Update previous record
  if (previous && previous.km_at_service != null) {
    const kmDiff = this.km_at_service - previous.km_at_service;

    if (kmDiff > 0) {
      const prevPartsTotal =
        previous.spare_part?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;

      const prevTotalCost = Number(
        (previous.labour_cost + prevPartsTotal).toFixed(2)
      );

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
      await this.constructor.updateOne(
        { _id: previous._id },
        { $set: { km_diff: null, cost_per_km: null } }
      );
    }
  }
});

export default mongoose.model(
  'VehicleMaintenance',
  VehicleMaintenanceSchema
);
