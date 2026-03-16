// backend/src/validators/maintenanceValidator.js
import { z } from 'zod';


const sparePartSchema = z.object({
  part: z.string().min(1).trim(),

  service_type: z.enum([
    'replace',
    'clean',
    'repair',
    'inspect and clean',
    'inspect',
    'rotation',
    'lubricate and clean',
  ]),

  cost: z.number().min(0),

  service_provider: z.string().min(1).trim(),

  inspected_by: z.string().min(1).trim(),

  mileage: z.number().min(0),
});

export const createVehicleMaintenanceSchema = z.object({
  body: z.object({
    plate_no: z.string().trim().min(3).max(20).toUpperCase(),

    workshop_name: z.string().trim().optional(),

    invoice_no: z.string().min(1).trim().toUpperCase(),

    location: z.string().min(1).trim().optional(),

    maintenance_type: z.enum([
      'Preventive',
      'Corrective',
      'Breakdown',
      'Body & Paint',
    ]),

    labour_cost: z.number().min(0).default(0),

    spare_part: z.array(sparePartSchema).optional(),

    km_at_service: z.number().min(0),

    date_in: z.coerce.date(),

    date_out: z.coerce.date().optional(),

    remark: z.string().trim().optional(),
  }),
});

export const updateVehicleMaintenanceSchema = z.object({
  body: z
    .object({
      plate_no: z.string().trim().min(3).max(20).toUpperCase().optional(),

      workshop_name: z.string().trim().optional(),

      invoice_no: z.string().min(1).trim().toUpperCase().optional(),

      location: z.string().min(1).trim().optional(),

      maintenance_type: z
        .enum(['Preventive', 'Corrective', 'Breakdown', 'Body & Paint'])
        .optional(),

      labour_cost: z.number().min(0).optional(),

      spare_part: z.array(sparePartSchema).optional(),

      km_at_service: z.number().min(0).optional(),

      date_in: z.coerce.date().optional(),

      date_out: z.coerce.date().optional(),

      remark: z.string().trim().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Request body cannot be empty for update',
      path: [],
    }),
});


export const createGeneratorServiceSchema = z.object({
  body: z.object({
    generatorSerialNo: z.string().min(1, 'Generator serial number is required'),
    hour_meter_reading: z.number().min(0, 'Hour meter reading must be positive'),
    next_service_hour: z.number().min(0, 'Next service hour must be positive'),
    maintenance_type: z.enum(['Preventive', 'Corrective', 'Breakdown', 'Body & Paint']),
    description: z.string().optional(),
    service_provider: z.string().min(1, 'Service provider is required'),
    service_date: z.string().datetime(),
    cost: z.number().min(0, 'Cost must be positive'),
    status: z.string().min(1, 'Status is required'),
  }),
});

export const updateGeneratorServiceSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid service ID'),
  }),
  body: z.object({
    hour_meter_reading: z.number().min(0).optional(),
    next_service_hour: z.number().min(0).optional(),
    maintenance_type: z.enum(['Preventive', 'Corrective', 'Breakdown', 'Body & Paint']).optional(),
    description: z.string().optional(),
    service_provider: z.string().optional(),
    service_date: z.string().datetime().optional(),
    cost: z.number().min(0).optional(),
    status: z.string().optional(),
    // generatorId cannot be updated
  }),
});