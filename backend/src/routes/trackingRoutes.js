// routes/tracking.routes.js
import express from 'express';
import { createAccident, getAccidents, updateAccident } from '../controllers/accidentController.js';
import { createFuelExpense, getFuelExpenses, updateFuelExpense } from '../controllers/fuelController.js';
import { validate } from '../middleware/validate.js';
import { createAccidentSchema,updateAccidentSchema, updateFuelExpenseSchema, createFuelExpenseSchema} from '../validators/trackingValidator.js'

// Import your auth/protection middleware if you have one (e.g., protect, restrictTo)
// import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Shared protection for all tracking routes (Admin or Customer Service)
// router.use(protect);
// router.use(restrictTo('Admin', 'Customer Service'));

// Accident Routes
router
  .route('/accidents')
  .post(validate(createAccidentSchema),createAccident)
  .get(getAccidents);

router.route('/accidents/:id').patch(validate(updateAccidentSchema),updateAccident);

// Fuel Expense Routes
router
  .route('/fuel')
  .post(validate(createFuelExpenseSchema),createFuelExpense)
  .get(getFuelExpenses);

router.route('/fuel/:id').patch(validate(updateFuelExpenseSchema),updateFuelExpense);

export default router;