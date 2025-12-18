// backend/src/controllers/generatorController.js
import Generator from '../models/Generator.js';
import catchAsync from '../utils/catchAsync.js';

// POST /api/v1/generators - Create new generator
export const createGenerator = catchAsync(async (req, res, next) => {
  const generator = await Generator.create(req.body);

  res.status(201).json({
    message : "Generator registered successfully",
    success: true,
    data: generator,
  });
});

// GET /api/v1/generators - List all with filter & pagination
export const getAllGenerators = catchAsync(async (req, res, next) => {
  const {
    location,
    allocation,
    engine_brand,
    serial_no,
    capacity_min,
    capacity_max,
    status,
    page = 1,
    limit = 20,
    sort = 'serial_no',
  } = req.query;

  const filter = {};

  if (location) filter.location = { $regex: location, $options: 'i' };
  if (allocation) filter.allocation = { $regex: allocation, $options: 'i' };
  if (engine_brand) filter.engine_brand = { $regex: engine_brand, $options: 'i' };
  if (serial_no) filter.serial_no = { $regex: serial_no, $options: 'i' };
  if (status) filter.status = status;

  // Respect exact field name: capacity
  if (capacity_min || capacity_max) {
    filter.capacity = {};
    if (capacity_min) filter.capacity.$gte = Number(capacity_min);
    if (capacity_max) filter.capacity.$lte = Number(capacity_max);
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  let sortObj = { serial_no: 1 }; // default ascending
  if (sort) {
    sortObj = {};
    sort.split(',').forEach((field) => {
      const order = field.startsWith('-') ? -1 : 1;
      const key = field.startsWith('-') ? field.slice(1) : field;
      sortObj[key] = order;
    });
  }

  const total = await Generator.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum);

  const generators = await Generator.find(filter)
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum)
    .lean();

  res.status(200).json({
    success: true,
    count: generators.length,
    total,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    data: generators,
  });
});
// GET /api/v1/generators/:id
export const getGeneratorById = catchAsync(async (req, res, next) => {
  const generator = await Generator.findById(req.params.id);

  if (!generator) {
    return res.status(404).json({
      success: false,
      message: 'Generator not found',
    });
  }

  res.status(200).json({
    success: true,
    data: generator,
  });
});

// PATCH /api/v1/generators/:id - Update generator
export const updateGenerator = catchAsync(async (req, res, next) => {
  const generator = await Generator.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!generator) {
    return res.status(404).json({
      success: false,
      message: 'Generator not found',
    });
  }

  res.status(200).json({
    success: true,
    message:"Generator recored updated successfully",
    data: generator,
  });
});