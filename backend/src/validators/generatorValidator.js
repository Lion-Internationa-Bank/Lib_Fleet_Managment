// backend/src/validators/generatorValidator.js
import { z } from 'zod';

export const createGeneratorSchema = z.object({
  body: z.object({
    location: z.string().min(1, 'Location is required'),
    allocation: z.string().min(1, 'Allocation is required'),
    capacity: z.number().positive('Capacity must be positive'),
    engine_brand: z.string().min(1, 'Engine brand is required'),
    serial_no: z.string().min(1, 'Serial number is required').toUpperCase(),
    acquisition_cost: z.number().min(0, 'Cost cannot be negative').optional(),
    acquisition_date: z.coerce.date(),
    current_hour_meter: z.number().min(0).default(0).optional(),
    last_service_date: z.string().datetime().or(z.date()).optional(),
    next_service_date: z.string().datetime().or(z.date()).optional(),
    status: z.string().optional(),
  }),
});


export const updateGeneratorSchema = z.object({
  body: z.object({
    location: z.string().min(1, 'Location is required').optional(),
    allocation: z.string().min(1, 'Allocation is required').optional(),
    capacity: z.number().positive('Capacity must be positive').optional(),
    engine_brand: z.string().min(1, 'Engine brand is required').optional(),
    serial_no: z.string().min(1, 'Serial number is required').toUpperCase().optional(),
    acquisition_cost: z.number().min(0, 'Cost cannot be negative').optional().optional(),
    acquisition_date: z.coerce.date().optional(),
    current_hour_meter: z.number().min(0).default(0).optional(),
    last_service_date: z.coerce.date().optional(),
    status: z.string().optional(),
  }) .refine((data) => Object.keys(data).length > 0, {
    message: "Request body cannot be empty for update",
    path: [], // This shows error at root level
  }),
});

