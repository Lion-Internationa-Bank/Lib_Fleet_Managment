// backend/src/controllers/maintenanceController.js
import VehicleMaintenance from '../models/VehicleMaintenance.js';
import GeneratorService from '../models/GeneratorService.js';
import Vehicle from '../models/Vehicle.js';
import Generator from "../models/Generator.js"
import catchAsync from '../utils/catchAsync.js';
// ==================== VEHICLE MAINTENANCE ====================

export const createVehicleMaintenance = catchAsync(async (req, res, next) => {
  const plateNo = req.body.plate_no.trim().toUpperCase();

  // 1. Check if vehicle exists
  const vehicle = await Vehicle.findOne({ plate_no: plateNo });
  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle record not found',
    });
  }

  // 2. Create maintenance record
  const maintenance = await VehicleMaintenance.create({
    ...req.body,
    plate_no: plateNo,
    vehicle_type: vehicle.vehicle_type,    
    location:vehicle.vehicle_allocation,      
    km_at_service: req.body.km_at_service,
            
  });

  // 3. Update Vehicle document only if date_out is present
  if (req.body.date_out) {
    const dateOut = new Date(req.body.date_out);
    const nextServiceDate = new Date(dateOut);
    nextServiceDate.setMonth(nextServiceDate.getMonth() + 6);

    await Vehicle.updateOne(
      { _id: vehicle._id },
      {
        last_service_date: dateOut,
        next_service_date: nextServiceDate,
        current_km: req.body.km_at_service,   
      }
    );
  }

  res.status(201).json({
    success: true,
    message: 'Vehicle Maintenance record registered successfully',
    data: maintenance,
  });
});

export const getAllVehicleMaintenances = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    plate_no,
    maintenance_type,
    sort = '-date_out',
  } = req.query;

  const filter = {};
  if (plate_no) filter.plate_no = { $regex: plate_no, $options: 'i' };
  if (maintenance_type) filter.maintenance_type = maintenance_type;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const total = await VehicleMaintenance.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum);

  const records = await VehicleMaintenance.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: records.length,
    total,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    data: records,
  });
});

export const getVehicleMaintenanceHistory = catchAsync(async (req, res, next) => {
  const { plateNo } = req.params;
  const {
    page = 1,
    limit = 50,
    sort = '-date_out',
  } = req.query;

  const normalizedPlateNo = plateNo.toUpperCase();

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const total = await VehicleMaintenance.countDocuments({ plate_no: normalizedPlateNo });
  const totalPages = Math.ceil(total / limitNum);

  const history = await VehicleMaintenance.find({ plate_no: normalizedPlateNo })
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    plate_no: normalizedPlateNo,
    count: history.length,
    total,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    data: history,
  });
});

export const updateVehicleMaintenance = catchAsync(async (req, res, next) => {
  const maintenance = await VehicleMaintenance.findById(req.params.id);

  if (!maintenance) {
    return res.status(404).json({
      success: false,
      message: "Vehicle maintenance record not found",
    });
  }

  // Update maintenance fields
  Object.keys(req.body).forEach((key) => {
    maintenance[key] = req.body[key];
  });

  await maintenance.save();

  // Update vehicle ONLY if date_out exists
  if (req.body.date_out) {
    // Find the most recent maintenance for this plate number
    const latestMaintenance = await VehicleMaintenance.findOne({
      plate_no: maintenance.plate_no,
    })
      .sort({ createdAt: -1 })
      .select("_id");

    // Only update vehicle if this maintenance is the latest
    if (latestMaintenance && latestMaintenance._id.equals(maintenance._id)) {
      const dateOut = new Date(req.body.date_out);

      const nextServiceDate = new Date(dateOut);
      nextServiceDate.setMonth(nextServiceDate.getMonth() + 6);

      const vehicleUpdate = {
        last_service_date: dateOut,
        next_service_date: nextServiceDate,
      };

      if (req.body.current_km !== undefined) {
        vehicleUpdate.current_km = req.body.current_km;
      }

      await Vehicle.updateOne(
        { plate_no: maintenance.plate_no },
        vehicleUpdate
      );
    }
  }

  res.status(200).json({
    success: true,
    message: "Vehicle maintenance record updated successfully",
    data: maintenance,
  });
});



// ==================== GENERATOR MAINTENANCE ====================

export const createGeneratorService = catchAsync(async (req, res, next) => {
  const { generatorSerialNo } = req.body;
  
  // Check if generator exists by serial number
  const generator = await Generator.findOne({ serial_no: generatorSerialNo.toUpperCase() });

  if (!generator) {
    return res.status(404).json({
      success: false,
      message: 'Generator with this serial number not found',
    });
  }

  // Fill allocation from generator and set generatorId
  req.body.allocation = generator.allocation;
  req.body.generatorId = generator._id;
  
  // Remove serialNo from body as we use generatorId
  delete req.body.generatorSerialNo;

  // Create service record
  const service = await GeneratorService.create(req.body);

  // Prepare generator update object
  const generatorUpdate = {};

  if (req.body.service_date) {
    const serviceDate = new Date(req.body.service_date);
    const nextServiceDate = new Date(serviceDate);
    nextServiceDate.setFullYear(nextServiceDate.getFullYear() + 1);

    generatorUpdate.last_service_date = serviceDate;
    generatorUpdate.next_service_date = nextServiceDate;
  }

  if (req.body.hour_meter_reading) {
    generatorUpdate.current_hour_meter = req.body.hour_meter_reading;
  }

  if (req.body.status) {
    generatorUpdate.status = req.body.status;
  }

  // Update generator only if needed
  if (Object.keys(generatorUpdate).length > 0) {
    await Generator.updateOne(
      { _id: generator._id },
      generatorUpdate
    );
  }

  // Populate generator details for response
  const populatedService = await GeneratorService.findById(service._id)
    .populate('generatorId', 'serial_no capacity allocation');

  res.status(201).json({
    success: true,
    message: 'Generator service record registered successfully',
    data: populatedService,
  });
});

export const getAllGeneratorServices = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    generatorSerialNo,
    maintenance_type,
    sort = '-service_date',
  } = req.query;

  const filter = {};
  
  // If searching by serial number, first find the generator
  if (generatorSerialNo) {
    const generator = await Generator.findOne({ 
      serial_no: { $regex: generatorSerialNo, $options: 'i' } 
    });
    if (generator) {
      filter.generatorId = generator._id;
    } else {
      // Return empty result if generator not found
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        pagination: {
          page: 1,
          limit: Number(limit),
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        data: [],
      });
    }
  }
  
  if (maintenance_type) filter.maintenance_type = maintenance_type;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const total = await GeneratorService.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum);

  const services = await GeneratorService.find(filter)
    .populate('generatorId', 'serial_no capacity allocation location')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: services.length,
    total,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    data: services,
  });
});

export const getGeneratorServiceHistory = catchAsync(async (req, res, next) => {
  const { generatorId } = req.params;
  const { 
    page = 1, 
    limit = 50, 
    sort = '-service_date' 
  } = req.query;

  // Verify generator exists
  const generator = await Generator.findById(generatorId);
  if (!generator) {
    return res.status(404).json({
      success: false,
      message: 'Generator not found',
    });
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const total = await GeneratorService.countDocuments({ generatorId });
  const totalPages = Math.ceil(total / limitNum);

  const history = await GeneratorService.find({ generatorId })
    .populate('generatorId', 'serial_no capacity allocation')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    generator: {
      id: generator._id,
      serial_no: generator.serial_no,
      capacity: generator.capacity,
      allocation: generator.allocation
    },
    count: history.length,
    total,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    data: history,
  });
});

export const updateGeneratorService = catchAsync(async (req, res, next) => {
  // 1. Find service
  const service = await GeneratorService.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Generator service record not found',
    });
  }

  // Prevent changing generator
  if (req.body.generatorId && req.body.generatorId.toString() !== service.generatorId.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot change generator for existing service record'
    });
  }

  // 2. Update service fields
  Object.assign(service, req.body);
  await service.save();

  // 3. Check if this is the latest created service
  const latestService = await GeneratorService.findOne({
    generatorId: service.generatorId,
  }).sort({ createdAt: -1 });

  const isLatest = latestService && latestService._id.equals(service._id);

  // 4. Update generator only if latest service
  if (isLatest) {
    const generatorUpdate = {};

    if (req.body.service_date) {
      const serviceDate = new Date(req.body.service_date);
      const nextServiceDate = new Date(serviceDate);
      nextServiceDate.setFullYear(nextServiceDate.getFullYear() + 1);

      generatorUpdate.last_service_date = serviceDate;
      generatorUpdate.next_service_date = nextServiceDate;
    }

    if (req.body.hour_meter_reading) {
      generatorUpdate.current_hour_meter = req.body.hour_meter_reading;
    }

    if (req.body.status) {
      generatorUpdate.status = req.body.status;
    }

    // update only if there is something to update
    if (Object.keys(generatorUpdate).length > 0) {
      await Generator.updateOne(
        { _id: service.generatorId },
        generatorUpdate
      );
    }
  }

  // Return populated service
  const updatedService = await GeneratorService.findById(service._id)
    .populate('generatorId', 'serial_no capacity allocation');

  res.status(200).json({
    success: true,
    message: 'Generator service record updated successfully',
    data: updatedService,
  });
});