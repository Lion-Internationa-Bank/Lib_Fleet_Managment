// backend/src/validators/tire.validator.js
import { z } from 'zod';

const POSITIONS = [
  'Front Left',
  'Front Right',
  'Middle Left',
  'Middle Right',
  'Rear Left',
  'Rear Right',
  'Spare',
];

const plateNoSchema = z.string().trim().regex(/^[A-Z0-9-]+$/i).toUpperCase().min(3);

const tireBaseSchema = z.object({
  plate_no: plateNoSchema,
  make: z.string().min(1, 'Tire make is required'),
  serial_no: z.string().min(1, 'Serial number is required'),
  ply_rate: z.number().int().min(1),
  position: z.enum(POSITIONS),
  fitted_date: z.coerce.date(),
  fitted_km: z.number().min(0),
  unit_price: z.number().min(0),
  status: z.enum(['Active', 'Worn Out']).optional(),
  reason_for_change: z.string().optional().nullable(),
  worn_out_date: z.coerce.date().optional().nullable(),
  worn_out_km: z.number().optional().nullable(),
  reason_for_change: z.string().max(500, 'Reason too long (max 500 chars)').optional().nullable(),
});

export const createTireSchema = z.object({
  body: tireBaseSchema,
});

export const updateTireSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid tire ID'),
  }),
  body: tireBaseSchema.partial().extend({
    rotation_history: z
      .array(
        z.object({
          from_position: z.enum(POSITIONS),
          to_position: z.enum(POSITIONS),
          rotation_date: z.coerce.date(),
          km_at_rotation: z.number().min(0),
        })
      )
      .optional(),
  }),
});

export const tireIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const plateNoParamSchema = z.object({
  params: z.object({
    plateNo: plateNoSchema,
  }),
});

export const tireRotationSchema = z.object({
  body: z.object({
    from_tire_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid from_tire_id'),
    to_tire_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid to_tire_id'),
    rotation_date: z.coerce.date().default(() => new Date()),
    km_at_rotation: z.number().min(0, 'KM must be >= 0'),
    reason: z.string().optional(),
  }).refine((data) => data.from_tire_id !== data.to_tire_id, {
    message: 'from_tire_id and to_tire_id cannot be the same',
  }),
});