// backend/src/validators/maintenanceValidator.js
import { z } from 'zod';

export const createVehicleMaintenanceSchema = z.object({
  body: z.object({
    plate_no: z.string().trim().min(3).max(20).toUpperCase(),
    workshop_name: z.string().optional(),
    invoice_no: z.string().min(1).trim().toUpperCase(),
    location: z.string().min(1).trim(),
    maintenance_type: z.enum(['Preventive', 'Corrective', 'Breakdown', 'Body & Paint']),
    labour_cost: z.number().min(0).default(0),
    replaced_spare_part: z
      .array(
        z.object({
          part: z.string().min(1),
          cost: z.number().min(0),
        })
      )
      .optional(),
    km_at_service: z.number().min(0).optional(),
    date_in: z.coerce.date(),
    date_out: z.coerce.date().optional(),
    remark: z.string().optional(),
  }),
});

// export const updateVehicleMaintenanceSchema = createVehicleMaintenanceSchema.partial();
export const updateVehicleMaintenanceSchema = z.object({
  body: z.object({
    plate_no: z.string().trim().min(3).max(20).toUpperCase().optional(),
    workshop_name: z.string().optional(),
    invoice_no: z.string().min(1).trim().toUpperCase().optional(),
    location: z.string().min(1).trim().optional(),
    maintenance_type: z.enum(['Preventive', 'Corrective', 'Breakdown', 'Body & Paint']).optional(),
    labour_cost: z.number().min(0).default(0).optional(),
    replaced_spare_part: z
      .array(
        z.object({
          part: z.string().min(1),
          cost: z.number().min(0),
        })
      )
      .optional(),
    km_at_service: z.number().min(0).optional(),
    date_in: z.coerce.date().optional(),
    date_out: z.coerce.date().optional(),
    remark: z.string().optional(),
  }) .refine((data) => Object.keys(data).length > 0, {
    message: "Request body cannot be empty for update",
    path: [], // This shows error at root level
  }),
});

export const createGeneratorServiceSchema = z.object({
  body: z.object({
    generatorId: z.string().length(24), // ObjectId
    hour_meter_reading: z.number().min(0),
    maintenance_type: z.string().optional(),
    description: z.string().optional(),
    service_provider: z.string().optional(),
    service_date: z.coerce.date(),
    cost: z.number().min(0),
    status: z.string(),
  }),
});


export const updateGeneratorServiceSchema = z.object({
  body: z.object({
    hour_meter_reading: z.number().min(0).optional(),
    maintenance_type: z.string().optional(),
    description: z.string().optional(),
    service_provider: z.string().optional(),
    service_date: z.coerce.date().optional(),
    cost: z.number().min(0).optional(),
    status: z.string().optional(),
  }) .refine((data) => Object.keys(data).length > 0, {
    message: "Request body cannot be empty for update",
    path: [], // This shows error at root level
  }),
});