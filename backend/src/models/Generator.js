import mongoose from "mongoose";

const GeneratorSchema = new mongoose.Schema(
  {
    location: String,
    allocation: String,
    capacity: Number,
    engine_brand: String,
    serial_no: { type: String, unique: true, required: true, uppercase: true },
    acquisition_cost: Number,
    acquisition_date: Date,
    current_hour_meter: { type: Number, default: 0 },
    last_service_date: Date,
    next_service_date: Date,
    status: String,
  },
  { timestamps: true }
);

// Pre-save hook
GeneratorSchema.pre("save", function () {
  if (this.last_service_date && this.isModified("last_service_date")) {
    const nextService = new Date(this.last_service_date);
    nextService.setFullYear(nextService.getFullYear() + 1);
    this.next_service_date = nextService;
  }
});

GeneratorSchema.index({ next_service_date: 1 });

export default mongoose.model("Generator", GeneratorSchema);