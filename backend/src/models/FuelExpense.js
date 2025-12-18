//seen
// models/FuelExpense.js
import mongoose from 'mongoose';

const FuelExpenseSchema = new mongoose.Schema(
  {
    plate_no: {
      type: String,
      ref: 'Vehicle',
      required: true,
      uppercase: true,
      trim: true,
    },

    fuel_type: {
      type: String,
      required: true,
      enum: ['Diesel', 'Benzene', 'Octane'],
    },

    // USER FILLS 
    starting_date: {
      type: Date,
      required: true,
    },
    starting_km: {
      type: Number,
      required: true,
      min: 0,
    },
    fuel_in_birr: {
      type: Number,
      required: true,
      min: 0,
    },
    birr_per_liter: {
      type: Number,
      required: true,
      min: 0,
    },
    liter_used: { type: Number,
         default: null,
        },     // fuel_in_birr / birr_per_liter

    fuel_usage_type: {
      type: String,
      required: true,
    },
    remark: String,

    // THESE FIELDS ARE NULL AT CREATION → FILLED AUTOMATICALLY LATER
    ending_date: { type: Date, default: null },
    ending_km: { type: Number, default: null },
    km_diff: { type: Number, default: null },        // ending_km - starting_km
    km_per_lit: { type: Number, default: null },     // km_diff / liter_used
  },
  {
    timestamps: true,
  }
);

FuelExpenseSchema.index({ plate_no: 1, starting_date: -1 });


FuelExpenseSchema.pre('save', async function (next) {

    // 1. Calculate liter_used immediately
    this.liter_used = Number((this.fuel_in_birr / this.birr_per_liter).toFixed(3));

    // 2. Find the most recent previous fuel entry for this vehicle
    const previousEntry = await this.constructor
      .findOne({
        plate_no: this.plate_no,
        starting_date: { $lt: this.starting_date },
      })
      .sort({ starting_date: -1 })
      .select('_id starting_km liter_used')
      .lean(); // lean() = faster, no Mongoose document overhead

    // 3. If previous entry exists 
    if (previousEntry) {
      const kmDiff = Number((this.starting_km - previousEntry.starting_km).toFixed(2));
      const kmPerLit =
        previousEntry.liter_used > 0
          ? Number((kmDiff / previousEntry.liter_used).toFixed(2))
          : null;

      await this.constructor.updateOne(
        { _id: previousEntry._id },
        {
          $set: {
            ending_date: this.starting_date,
            ending_km: this.starting_km,
            km_diff: kmDiff,
            km_per_lit: kmPerLit,
          },
        }
      );
    }


});

export default mongoose.model('FuelExpense', FuelExpenseSchema);