import { z } from "zod";

export const createInsuranceSchema = z.object({
  body: z.object({
    insurance_provider: z.string().min(1, "Insurance provider is required"),
    insurance_renewal_date: z.coerce.date(),
    insurance_expired_date: z.coerce.date(),
  }),
});

export const updateInsuranceSchema = z.object({
   body: z.object({
    insurance_provider: z.string().min(1, "Insurance provider is required").optional(),
    insurance_renewal_date: z.coerce.date().optional(),
    insurance_expired_date: z.coerce.date().optional(),
  
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid insurance ID"),
  }),
});