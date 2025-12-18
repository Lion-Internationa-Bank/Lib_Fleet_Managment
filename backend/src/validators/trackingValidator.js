// validators/trackingValidator.js 
import { z } from 'zod';

// Accident Schemas
export const createAccidentSchema = z.object({
  body: z.object({
    plate_no: z.string().trim().min(3).max(20).toUpperCase(),
    accident_date: z.coerce.date(),
    accident_place: z.string().optional(),
    driver_name: z.string().optional(),
    damaged_part: z.string().optional(),
    accident_intensity: z.enum(['Low', 'Medium', 'High', 'Critical']),
    date_notified_insurance: z.coerce.date().optional().nullable(),
    date_police_report: z.coerce.date().optional().nullable(),
    date_insurance_surveyor: z.coerce.date().optional().nullable(),
    date_auction: z.coerce.date().optional().nullable(),
    date_into_garage: z.coerce.date().optional().nullable(),
    date_out_garage: z.coerce.date().optional().nullable(),
    current_situation: z.string().optional(),
    responsible_for_accident: z.enum(['3rd Party', 'Bank']).optional().nullable(),
    risk_base_price: z.number().min(0).optional().nullable(),
    old_age_contribution: z.number().min(0).optional().nullable(),
    total: z.number().min(0).optional().nullable(),
    action_taken: z.string().optional(),
  }),
});

export const updateAccidentSchema = z.object({
   body: z.object({
    plate_no: z.string().trim().min(3).max(20).toUpperCase().optional(),
    accident_date: z.coerce.date().optional(),
    accident_place: z.string().optional(),
    driver_name: z.string().optional(),
    damaged_part: z.string().optional(),
    accident_intensity: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    date_notified_insurance: z.coerce.date().optional().nullable(),
    date_police_report: z.coerce.date().optional().nullable(),
    date_insurance_surveyor: z.coerce.date().optional().nullable(),
    date_auction: z.coerce.date().optional().nullable(),
    date_into_garage: z.coerce.date().optional().nullable(),
    date_out_garage: z.coerce.date().optional().nullable(),
    current_situation: z.string().optional(),
    responsible_for_accident: z.enum(['3rd Party', 'Bank']).optional().nullable(),
    risk_base_price: z.number().min(0).optional().nullable(),
    old_age_contribution: z.number().min(0).optional().nullable(),
    total: z.number().min(0).optional().nullable(),
    action_taken: z.string().optional(),
  }), // allow partial updates
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId
  }),
});

// Fuel Expense Schemas
export const createFuelExpenseSchema = z.object({
  body: z.object({
    plate_no: z.string().trim().min(3).max(20).toUpperCase(),
    starting_date: z.coerce.date(),
    starting_km: z.number().min(0),
    fuel_in_birr: z.number().min(0),
    birr_per_liter: z.number().min(0.01), // avoid division by zero
    fuel_usage_type: z.string().min(1),
    remark: z.string().optional(),
  }),
});

export const updateFuelExpenseSchema = z.object({
   body: z.object({
    plate_no: z.string().trim().min(3).max(20).toUpperCase().optional(),
    starting_date: z.coerce.date().optional(),
    starting_km: z.number().min(0).optional(),
    fuel_in_birr: z.number().min(0).optional(),
    birr_per_liter: z.number().min(0.01).optional(), // avoid division by zero
    fuel_usage_type: z.string().min(1).optional(),
    remark: z.string().optional(),
  }), // partial for corrections
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});