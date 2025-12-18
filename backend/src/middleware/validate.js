// backend/src/middleware/validate.js
import { ZodError } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    // Only extract the parts that the schema expects (body, query, params)
    const dataToValidate = {};

    if (schema.shape.body) dataToValidate.body = req.body;
    if (schema.shape.query) dataToValidate.query = req.query;
    if (schema.shape.params) dataToValidate.params = req.params;

    schema.parse(dataToValidate);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // For any other unexpected error
    console.error('Validation middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal validation error',
    });
  }
};