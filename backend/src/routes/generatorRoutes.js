// backend/src/routes/generatorRoutes.js
import express from 'express';
// import { protect, restrictTo } from '../middleware/auth.js';
import {
  createGenerator,
  getAllGenerators,
  getGeneratorById,
  updateGenerator,
} from '../controllers/generatorController.js';
import { validate } from '../middleware/validate.js'; 
import {
  createGeneratorSchema,
  updateGeneratorSchema,
} from '../validators/generatorValidator.js';

const router = express.Router();

// router.use(protect);

// Create new generator - Only PFO
// router.post('/', restrictTo('PFO'), validate(createGeneratorSchema), createGenerator);
router.post('/', validate(createGeneratorSchema), createGenerator);
// router.get('/', restrictTo('Admin', 'PFO'), getAllGenerators);
router.get('/', getAllGenerators);

// Single generator by ID
router
  .route('/:id')
//   .get(restrictTo('Admin', 'PFO'), getGeneratorById)
     .get( getGeneratorById)
//   .patch(restrictTo('Admin', 'PFO'), validate(updateGeneratorSchema), updateGenerator);
     .patch(validate(updateGeneratorSchema), updateGenerator);  

export default router;