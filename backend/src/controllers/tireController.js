// backend/src/controllers/tire.controller.js
import Tire from '../models/Tire.js';
import Vehicle from '../models/Vehicle.js';
import catchAsync from '../utils/catchAsync.js';
import mongoose from "mongoose";

const sendNotFound = (res, message = 'Tire not found') =>
  res.status(404).json({ success: false, message });

// CREATE Tire
export const createTire = catchAsync(async (req, res) => {
  const { plate_no } = req.body;

  // Verify vehicle exists
  const vehicle = await Vehicle.findOne({ plate_no: plate_no.toUpperCase() });
  if (!vehicle) {
    return res.status(400).json({
      success: false,
      message: 'Vehicle with this plate number does not exist',
    });
  }

  const tire = await Tire.create(req.body);

  res.status(201).json({
    success: true,
    data: tire,
  });
});

// GET All Tires (with filters & pagination)
export const getAllTires = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    plate_no,
    position,
    status,
    sort = '-fitted_date',
  } = req.query;

  const filter = {};
  if (plate_no) filter.plate_no = { $regex: plate_no, $options: 'i' };
  if (position) filter.position = position;
  if (status) filter.status = status;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const total = await Tire.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum);

  const tires = await Tire.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: tires.length,
    total,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    data: tires,
  });
});

// GET Tire by ID
export const getTireById = catchAsync(async (req, res) => {
  const tire = await Tire.findById(req.params.id);

  if (!tire) return sendNotFound(res);

  res.status(200).json({
    success: true,
    data: tire,
  });
});

// GET Tires by Plate No
export const getTiresByPlateNo = catchAsync(async (req, res) => {
  const { plateNo } = req.params;
  const { status = 'Active', include_history = 'false' } = req.query;

  const filter = {
    plate_no: plateNo.toUpperCase(),
  };

  if (status !== 'all') {
    filter.status = status === 'true' || status === 'Active' ? 'Active' : 'Worn Out';
  }

  const tires = await Tire.find(filter).sort({ position: 1 });

  // Optionally include worn out if requested
  if (include_history === 'true') {
    delete filter.status;
    const all = await Tire.find(filter).sort('-worn_out_date');
    return res.status(200).json({
      success: true,
      plate_no: plateNo.toUpperCase(),
      count: all.length,
      data: all,
    });
  }

  res.status(200).json({
    success: true,
    plate_no: plateNo.toUpperCase(),
    count: tires.length,
    data: tires,
  });
});

// UPDATE Tire (PATCH) - uses .save() to trigger pre-save hook if needed
export const updateTire = catchAsync(async (req, res) => {
  const tire = await Tire.findById(req.params.id);
  if (!tire) return sendNotFound(res);

  const oldFittedKm = tire.fitted_km;
  const oldFittedDate = tire.fitted_date;

  // Apply updates to current tire
  Object.keys(req.body).forEach((key) => {
    tire[key] = req.body[key];
  });

  await tire.save(); // save current tire first

  /* ------------------------------------------------
     UPDATE PREVIOUS TIRE IF FITTED DATA CHANGED
  ------------------------------------------------ */
  const fittedKmChanged =
    req.body.fitted_km != null && req.body.fitted_km !== oldFittedKm;

  const fittedDateChanged =
    req.body.fitted_date != null &&
    new Date(req.body.fitted_date).getTime() !==
      new Date(oldFittedDate).getTime();

  if (fittedKmChanged || fittedDateChanged) {
    const previousTire = await Tire.findOne({
      plate_no: tire.plate_no,
      position: tire.position,
      status: 'Worn Out',
      _id: { $lt: tire._id },
    }).sort({ createdAt: -1 });

    if (previousTire) {
      // Update worn-out date
      if (fittedDateChanged) {
        previousTire.worn_out_date = tire.fitted_date;
      }

      // Update worn-out km and calculations
      if (fittedKmChanged && tire.fitted_km > previousTire.fitted_km) {
        const kmDiff = tire.fitted_km - previousTire.fitted_km;

        previousTire.worn_out_km = tire.fitted_km;
        previousTire.km_difference = kmDiff;
        previousTire.cost_per_km = Number(
          (previousTire.unit_price / kmDiff).toFixed(4)
        );
      }

      await previousTire.save();
    }
  }

  res.status(200).json({
    success: true,
    data: tire,
  });
});



// TIRE ROTATION 

// TIRE ROTATION - Atomic swap using MongoDB transaction
// TIRE ROTATION - Safe rotation using temporary position
export const rotateTires = catchAsync(async (req, res) => {
  const {
    from_tire_id,
    to_tire_id,
    rotation_date = new Date(),
    km_at_rotation,
    reason = 'Tire rotation for even wear',
  } = req.body;

  if (!km_at_rotation) {
    return res.status(400).json({
      success: false,
      message: 'km_at_rotation is required',
    });
  }

  const [fromTire, toTire] = await Promise.all([
    Tire.findById(from_tire_id),
    Tire.findById(to_tire_id),
  ]);

  if (!fromTire || !toTire) {
    return res.status(404).json({
      success: false,
      message: 'One or both tires not found',
    });
  }

  if (fromTire.plate_no !== toTire.plate_no) {
    return res.status(400).json({
      success: false,
      message: 'Both tires must belong to the same vehicle',
    });
  }

  if (fromTire.status !== 'Active' || toTire.status !== 'Active') {
    return res.status(400).json({
      success: false,
      message: 'Only Active tires can be rotated',
    });
  }

  const fromPosition = fromTire.position;
  const toPosition = toTire.position;

  if (fromPosition === toPosition) {
    return res.status(400).json({
      success: false,
      message: 'Cannot rotate a tire to its current position',
    });
  }

  // Add rotation history
  fromTire.rotation_history.push({
    from_position: fromPosition,
    to_position: toPosition,
    rotation_date,
    km_at_rotation,
    reason,
  });

  toTire.rotation_history.push({
    from_position: toPosition,
    to_position: fromPosition,
    rotation_date,
    km_at_rotation,
    reason,
  });

  // Mark as rotation to skip replacement logic
  fromTire._isRotation = true;
  toTire._isRotation = true;

  // STEP 1: Move fromTire to a temporary dummy position
  fromTire.position = 'TEMP-ROTATION'; // not in enum, but we'll bypass validation
  fromTire.markModified('position'); // important for Mongoose
  await fromTire.save();

  // STEP 2: Now safely move toTire to fromPosition (no conflict)
  toTire.position = fromPosition;
  toTire.markModified('position');
  await toTire.save();

  // STEP 3: Finally move fromTire to its final position (toPosition)
  fromTire.position = toPosition;
  fromTire.markModified('position');
  await fromTire.save();

  // Clean up
  delete fromTire._isRotation;
  delete toTire._isRotation;

  res.status(200).json({
    success: true,
    message: 'Tires successfully rotated (positions swapped)',
    data: {
      rotation_summary: {
        date: rotation_date,
        km_at_rotation,
        reason,
      },
      tire_1: {
        _id: fromTire._id,
        serial_no: fromTire.serial_no,
        previous_position: fromPosition,
        new_position: toPosition,
      },
      tire_2: {
        _id: toTire._id,
        serial_no: toTire.serial_no,
        previous_position: toPosition,
        new_position: fromPosition,
      },
    },
  });
});