// backend/src/controllers/vehicleController.js
import Vehicle from '../models/Vehicle.js';
import catchAsync from '../utils/catchAsync.js'; 

// Helper: Not Found response
const sendNotFound = (res, plateNo) =>
  res.status(404).json({
    success: false,
    message: `Vehicle with plate number '${plateNo}' not found`,
  });

// POST /api/v1/vehicles - Register new vehicle
export const createVehicle = catchAsync(async (req, res) => {
  const vehicle = await Vehicle.create(req.body);

  res.status(201).json({
    success: true,
    message: `Vehicle plate ${req.body.plate_no} registered successfully`,
    data: vehicle,
  });
});

// GET /api/v1/vehicles - With filters, pagination, sorting
export const getAllVehicles = catchAsync(async (req, res) => {
  const {
    plate_no,
    location,
    vehicle_allocation,
    vehicle_type,
    fuel_type,
    bolo_expired_date,
    page = 1,
    limit = 20,
    sort = 'plate_no',
  } = req.query;

  const filter = {};

  if (plate_no) filter.plate_no = { $regex: plate_no, $options: 'i' };
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (vehicle_allocation) filter.vehicle_allocation = { $regex: vehicle_allocation, $options: 'i' };
  if (vehicle_type) filter.vehicle_type = { $regex: vehicle_type, $options: 'i' };
  if (fuel_type) filter.fuel_type = fuel_type;
  if (bolo_expired_date) {
    filter.bolo_expired_date = { $lte: new Date(bolo_expired_date) };
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  let sortObj = { plate_no: 1 };
  if (sort) {
    sortObj = {};
    sort.split(',').forEach((field) => {
      const order = field.startsWith('-') ? -1 : 1;
      const key = field.startsWith('-') ? field.slice(1) : field;
      sortObj[key] = order;
    });
  }

  const total = await Vehicle.countDocuments(filter);
  
  // Select specific fields to return
  const vehicles = await Vehicle.find(filter)
    .select(
      'plate_no location vehicle_allocation vehicle_type vehicle_model fuel_type current_km next_service_date bolo_expired_date'
    )
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum)
    .lean();

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    count: vehicles.length,
    total,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    data: vehicles.map(vehicle => ({
      plate_no: vehicle.plate_no,
      location: vehicle.location,
      vehicle_allocation: vehicle.vehicle_allocation,
      vehicle_type: vehicle.vehicle_type,
      vehicle_model: vehicle.vehicle_model,
      fuel_type: vehicle.fuel_type,
      current_km: vehicle.current_km,
      next_service_date: vehicle.next_service_date,
      bolo_expired_date: vehicle.bolo_expired_date
    })),
  });
});

// GET /api/v1/vehicles/:plateNo
export const getVehicleByPlateNo = catchAsync(async (req, res) => {
  const vehicle = await Vehicle.findOne({ plate_no: req.params.plateNo.toUpperCase() });

  if (!vehicle) return sendNotFound(res, req.params.plateNo);

  res.status(200).json({
    success: true,
    data: vehicle,
  });
});

// PUT /api/v1/vehicles/:plateNo - Full update
export const updateVehicleFull = catchAsync(async (req, res) => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { plate_no: req.params.plateNo.toUpperCase() },
    req.body,
    { new: true, runValidators: true }
  );

  if (!vehicle) return sendNotFound(res, req.params.plateNo);

  res.status(200).json({
    success: true,
    message: 'Vehicle info updated successfully',
    data: vehicle,
  });
});

// PATCH /api/v1/vehicles/:plateNo/location
export const updateVehicleLocation = catchAsync(async (req, res) => {
  const updates = {
    location: req.body.location,
    vehicle_allocation: req.body.vehicle_allocation,
  };

  const vehicle = await Vehicle.findOneAndUpdate(
    { plate_no: req.params.plateNo.toUpperCase() },
    updates,
    { new: true, runValidators: true }
  );

  if (!vehicle) return sendNotFound(res, req.params.plateNo);

  const locationInfo = updates.location ? `Location: ${updates.location}` : '';
  const allocationInfo = updates.vehicle_allocation ? `Allocation: ${updates.vehicle_allocation}` : '';
  const updateDetails = [locationInfo, allocationInfo].filter(Boolean).join(', ');

  const message = updateDetails
    ? `Vehicle plate ${req.params.plateNo} updated - ${updateDetails}`
    : `Vehicle plate ${req.params.plateNo} updated`;

  res.status(200).json({
    success: true,
    message,
    data: vehicle,
  });
});

// PATCH /api/v1/vehicles/:plateNo/compliance
export const updateVehicleCompliance = catchAsync(async (req, res) => {
  const updates = {
    bolo_expired_date: req.body.bolo_expired_date,
  };

  const vehicle = await Vehicle.findOneAndUpdate(
    { plate_no: req.params.plateNo.toUpperCase() },
    updates,
    { new: true, runValidators: true }
  );

  if (!vehicle) return sendNotFound(res, req.params.plateNo);

  const formattedDate = vehicle.bolo_expired_date
    ? new Date(vehicle.bolo_expired_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Not set';

  res.status(200).json({
    success: true,
    message: `BOLO expired date for vehicle plate ${req.params.plateNo} updated to ${formattedDate}`,
    data: vehicle,
  });
});