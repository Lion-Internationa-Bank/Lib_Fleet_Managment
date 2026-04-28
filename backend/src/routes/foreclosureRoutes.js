// backend/src/routes/foreclosureRoutes.js
import express from 'express';
// import { protect, restrictTo } from '../middleware/auth.js';
import {
  createForeclosure,
  getForeclosuresVehicles,
  updateForeclosure,
  updateForeclosureDateOut,
} from '../controllers/foreclosureController.js';

const router = express.Router();


router.get('/',getForeclosuresVehicles)
router.post('/',createForeclosure)
// router.patch('/:id', restrictTo('Admin'), updateForeclosure);
router.put('/:plateNo', updateForeclosure);

// router.patch('/date-out/:id',restrictTo('Admin', 'PFO'), updateForeclosureDateOut);
router.patch('/date-out/:plateNo', updateForeclosureDateOut);

export default router;