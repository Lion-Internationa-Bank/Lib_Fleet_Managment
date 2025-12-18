// controllers/accidentController.js
import Accident from '../models/Accident.js';
import Vehicle from '../models/Vehicle.js'; 
import catchAsync from '../utils/catchAsync.js';

const buildAccidentQuery = (query) => {
  const filters = {};

  if (query.plate_no) filters.plate_no = new RegExp(query.plate_no, 'i');
  if (query.accident_intensity) filters.accident_intensity = query.accident_intensity;
  if (query.start_date) filters.accident_date = { ...filters.accident_date, $gte: new Date(query.start_date) };
  if (query.end_date) filters.accident_date = { ...filters.accident_date, $lte: new Date(query.end_date) };
  if (query.responsible_for_accident) filters.responsible_for_accident = query.responsible_for_accident;

  return filters;
};

export const createAccident = catchAsync(async (req, res, next) => {
  const { plate_no } = req.body;

  // Check if vehicle exists
  const vehicle = await Vehicle.findOne({ plate_no: plate_no.toUpperCase() });
  if (!vehicle) {
    return res.status(400).json({
      status: 'fail',
      message: 'Vehicle with this plate number does not exist.',
    });
  }

  const accident = await Accident.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { accident },
  });
});



export const getAccidents = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    sort = '-accident_date',
  } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const filters = buildAccidentQuery(req.query);

  const accidents = await Accident.find(filters)
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  const total = await Accident.countDocuments(filters);

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    count: accidents.length,
    total,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    data: accidents, 
  });
});

export const updateAccident = catchAsync(async (req, res, next) => {
  const accident = await Accident.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!accident) {
    return res.status(404).json({
      status: 'fail',
      message: 'Accident record not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: { accident },
  });
});