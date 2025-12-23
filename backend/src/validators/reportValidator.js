import { z } from 'zod';

const reportSchema = z.object({
  query: z.object({
    format: z.enum(['excel', 'pdf', 'word']).default('excel'),
    period: z.enum(['monthly', 'quarterly', 'halfyear', '9month', 'yearly']).optional(),
    startDate: z.string().datetime({ offset: true }).optional(),
    endDate: z.string().datetime({ offset: true }).optional(),
  }).refine(data => (data.period || (data.startDate && data.endDate)), {
    message: 'Provide either "period" or both "startDate" and "endDate"',
  }),
});
