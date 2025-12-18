// controllers/fuelController.js
import FuelExpense from '../models/FuelExpense.js';
import Vehicle from '../models/Vehicle.js';
import catchAsync from '../utils/catchAsync.js';

const buildFuelQuery = (query) => {
  const filters = {};

  if (query.plate_no) filters.plate_no = new RegExp(query.plate_no, 'i');
  if (query.fuel_type) filters.fuel_type = query.fuel_type;
  if (query.start_date) filters.starting_date = { ...filters.starting_date, $gte: new Date(query.start_date) };
  if (query.end_date) filters.starting_date = { ...filters.starting_date, $lte: new Date(query.end_date) };
  if (query.fuel_usage_type) filters.fuel_usage_type = new RegExp(query.fuel_usage_type, 'i');

  return filters;
};

export const createFuelExpense = catchAsync(async (req, res, next) => {
  const { plate_no } = req.body;

  // Check if vehicle exists
  const vehicle = await Vehicle.findOne({ plate_no: plate_no.toUpperCase() });
  if (!vehicle) {
    return res.status(400).json({
      status: 'fail',
      message: 'Vehicle with this plate number does not exist.',
    });
  }
    req.body.fuel_type = vehicle.fuel_type;
  const fuelExpense = await FuelExpense.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { fuelExpense },
  });
});

export const getFuelExpenses = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    sort = '-starting_date',
  } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const filters = buildFuelQuery(req.query);

  const fuelExpenses = await FuelExpense.find(filters)
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  const total = await FuelExpense.countDocuments(filters);

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    count: fuelExpenses.length,
    total,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    data: fuelExpenses, 
  });
});

export const updateFuelExpense = catchAsync(async (req, res, next) => {
  const fuelExpense = await FuelExpense.findById(req.params.id);

  if (!fuelExpense) {
    return res.status(404).json({
      status: 'fail',
      message: 'Fuel expense record not found',
    });
  }

  // Apply updates manually to trigger pre('save') hook
  Object.keys(req.body).forEach((key) => {
    fuelExpense[key] = req.body[key];
  });

  // This will trigger the pre('save') hook (liter_used recalc + previous record update)
  await fuelExpense.save();

  res.status(200).json({
    status: 'success',
    data: { fuelExpense },
  });
});