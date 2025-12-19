// models/Tire.js
import mongoose from 'mongoose';

const POSITIONS = [
  'Front Left',
  'Front Right',
  'Middle Left',
  'Middle Right',
  'Rear Left',
  'Rear Right',
  'Spare',
  ,'TEMP-ROTATION'
];

const TireSchema = new mongoose.Schema(
  {
    plate_no: {
      type: String,
      ref: 'Vehicle',
      required: true,
      uppercase: true,
      trim: true,
    },

    make: { type: String, required: true, trim: true },

    serial_no: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    ply_rate: { type: Number, required: true, min: 1 },

    position: {
      type: String,
      required: true,
      enum: POSITIONS,
    },

    status: {
      type: String,
      enum: ['Active', 'Worn Out'],
      default: 'Active',
    },

    fitted_date: { type: Date, required: true },

    fitted_km: { type: Number, required: true, min: 0 },

    worn_out_date: { type: Date, default: null },

    worn_out_km: { type: Number, default: null },

    km_difference: { type: Number, default: null },

    unit_price: { type: Number, required: true, min: 0 },

    cost_per_km: { type: Number, default: null },

    reason_for_change: { 
      type: String, 
      default: null, 
      trim: true 
    }, // ← Now populated from input

    /* ---------------- ROTATION ---------------- */
    rotation_history: [
      {
        from_position: { type: String, enum: POSITIONS },
        to_position: { type: String, enum: POSITIONS },
        rotation_date: { type: Date, required: true },
        km_at_rotation: { type: Number, required: true, min: 0 },
        reason: { type: String, trim: true }, // Added reason support
      },
    ],
  },
  { timestamps: true }
);

/* ------------------------------------------------
   PRE-SAVE: HANDLE REPLACEMENT - Use input reason_for_change
------------------------------------------------ */
TireSchema.pre('save', async function () {
     
  // Skip replacement logic during rotations
  if (this._isRotation) {
    return ;
  }

  // Only run on NEW tires 
  
if(this.isNew ){
    const previousTire = await this.constructor
    .findOne({
  plate_no: this.plate_no,
  position: this.position,
  // status: 'Active',
  _id: { $lt: this._id },
})
.sort({ createdAt: -1 });


  if (previousTire) {
    console.log("previous tire run ")
    const kmDiff = this.fitted_km - previousTire.fitted_km;

    previousTire.worn_out_date = this.fitted_date;
    previousTire.worn_out_km = this.fitted_km;

    if (kmDiff > 0) {
      previousTire.km_difference = kmDiff;
      previousTire.cost_per_km = Number(
        (previousTire.unit_price / kmDiff).toFixed(4)
      );
    }

    // Use reason_for_change from NEW tire input (req.body)
    previousTire.reason_for_change = this.reason_for_change || 'Replaced by new tire';
    previousTire.status = 'Worn Out';

    await previousTire.save();
  }

}
 
});

/* ---------------- INDEX ---------------- */
TireSchema.index(
  { plate_no: 1, position: 1 },
  { unique: true, partialFilterExpression: { status: 'Active' } }
);

export default mongoose.model('Tire', TireSchema);