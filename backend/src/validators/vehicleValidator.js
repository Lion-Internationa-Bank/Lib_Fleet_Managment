// backend/src/validators/vehicle.validator.js
import { z } from 'zod';

// Common plate_no schema
const plateNoSchema = z
  .string()
  .trim()
  .min(3, 'Plate number is too short')
  .regex(/^[A-Z0-9-]+$/i, 'Invalid plate number format')
  .toUpperCase();

// Fuel type enum from model
const fuelTypeEnum = z.enum(['Diesel', 'Benzene', 'Octane']);

// Base vehicle schema (used for create & updates)
const vehicleBaseSchema = z.object({
  plate_no: plateNoSchema,
  location: z.string().min(1, 'Location is required'),
  vehicle_allocation: z.string().min(1, 'Vehicle allocation is required'),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  body_color: z.string().min(1, 'Body color is required'),
  manufacturing_year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  vehicle_origin: z.string().min(1, 'Vehicle origin is required'),
  title_certificate_no: z.string().optional(),
  vehicle_model: z.string().min(1, 'Vehicle model is required'),
  chassis_no: z.string().min(1, 'Chassis number is required'),
  engine_no: z.string().min(1, 'Engine number is required'),
  seating_capacity: z.number().int().min(1, 'Seating capacity must be at least 1'),
  pay_load: z.number().min(0).optional(),
  total_weight: z.number().min(0).optional(),
  horse_power: z.number().min(0).optional(),
  no_of_cylinder: z.number().int().min(1).optional(),
  cc: z.number().min(0).optional(),
  drive_type: z.string().optional(),
  fuel_type: fuelTypeEnum,
  tyre_size: z.string().min(1, 'Tyre size is required'),
  original_price: z.number().min(0).optional(),
  total_price: z.number().min(0).optional(),
  delivery_date: z.coerce.date().optional(),
  bolo_expired_date: z.coerce.date(),
  supplier_company: z.string().optional(),

  // Auto-managed — usually not allowed in input (but safe to allow optional override by Admin)
  current_km: z.number().min(0).optional(),
  last_service_date: z.coerce.date().optional(),
  next_service_date: z.coerce.date().optional(),
  file_uploads: z.array(z.string().url()).optional(),
});

// CREATE Vehicle (POST /api/v1/vehicles)
export const createVehicleSchema = z.object({
  body: vehicleBaseSchema,
});

// FULL UPDATE (PUT /api/v1/vehicles/:plateNo)
export const updateVehicleFullSchema = z.object({
  params: z.object({
    plateNo: plateNoSchema,
  }),
  body: vehicleBaseSchema.partial(),
});

// PATCH /:plateNo/location
export const updateVehicleLocationSchema = z.object({
  params: z.object({
    plateNo: plateNoSchema,
  }),
  body: z.object({
    location: z.string().min(1).optional(),
    vehicle_allocation: z.string().min(1).optional(),
  }).refine((data) => data.location || data.vehicle_allocation, {
    message: 'At least one of location or vehicle_allocation must be provided',
  }),
});

// PATCH /:plateNo/compliance
export const updateVehicleComplianceSchema = z.object({
  params: z.object({
    plateNo: plateNoSchema,
  }),
  body: z.object({
    bolo_expired_date: z.coerce.date(),
  }),
});

// GET /:plateNo (params only)
export const getVehicleByPlateNoSchema = z.object({
  params: z.object({
    plateNo: plateNoSchema,
  }),
});

// Optional: PATCH for service dates (if you want a dedicated endpoint later)
export const updateVehicleServiceDatesSchema = z.object({
  params: z.object({
    plateNo: plateNoSchema,
  }),
  body: z.object({
    last_service_date: z.coerce.date().optional(),
    next_service_date: z.coerce.date().optional(),
    current_km: z.number().min(0).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one service field must be provided',
  }),
});