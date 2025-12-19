// backend/src/routes/tire.routes.js
import express from 'express';
import {
  createTire,
  getAllTires,
  getTireById,
  getTiresByPlateNo,
  updateTire,
  rotateTires,
} from '../controllers/tireController.js';
// import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  createTireSchema,
  updateTireSchema,
  tireIdParamSchema,
  plateNoParamSchema,
  tireRotationSchema,
} from '../validators/tireValidator.js';

const router = express.Router();

// router.use(protect); 
// router.use(restrictTo('Admin', 'PFO')); 

// GET all tires (with optional filters: plate_no, position, status, etc.)
router.get('/', getAllTires);

// POST create new tire
router.post('/', validate(createTireSchema), createTire);

// GET tires by vehicle plate_no
router.get('/vehicle/:plateNo', validate(plateNoParamSchema), getTiresByPlateNo);

// GET single tire by ID
router.get('/:id', validate(tireIdParamSchema), getTireById);

// Replace or add the rotation endpoint
router.patch(
  '/rotate',
  validate(tireRotationSchema),
  rotateTires
);

// PATCH update tire (e.g., rotation, worn out, correction)
router.patch('/:id', validate(updateTireSchema), updateTire);



export default router;