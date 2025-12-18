// backend/src/routes/foreclosureRoutes.js
import express from 'express';
// import { protect, restrictTo } from '../middleware/auth.js';
import {
  createForeclosure,
  getForeclosuresVehilces,
  updateForeclosure,
  updateForeclosureDateOut,
} from '../controllers/foreclosureController.js';

const router = express.Router();

router
  .route('/')
  //   .get(restrictTo('Admin', 'PFO'), getAllForeclosures);
  .get(getForeclosuresVehilces)
//   .post(restrictTo('PFO'), createForeclosure)
   .post(createForeclosure);


// router.patch('/:id', restrictTo('Admin'), updateForeclosure);
router.put('/:plateNo', updateForeclosure);

// router.patch('/date-out/:id',restrictTo('Admin', 'PFO'), updateForeclosureDateOut);
router.patch('/date-out/:plateNo', updateForeclosureDateOut);

export default router;