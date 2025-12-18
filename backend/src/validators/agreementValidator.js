import { z } from 'zod';

export const createAgreementSchema = z.object({
  body: z.object({
    service_provider: z.string().min(1, 'Service provider is required'),
    contract_renewal_date: z.coerce.date(),
    contract_expiry_date: z.coerce.date(),
  
  }),
});

export const updateAgreementSchema = z.object({
   body: z.object({
    service_provider: z.string().min(1, 'Service provider is required').optional(),
    contract_renewal_date: z.coerce.date().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid agreement ID'),
  }),
});