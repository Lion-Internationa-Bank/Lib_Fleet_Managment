import express from 'express';
import {
  createAgreement,
  getAgreements,
  updateAgreement,
} from '../controllers/agreementController.js';
// import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createAgreementSchema,
  updateAgreementSchema,
} from '../validators/agreementValidator.js';

const router = express.Router();

// Protect all routes and restrict to Admin (and PFO only for extend-service)
// router.use(protect);

router
  .route('/')
//   .post(restrictTo('Admin'), validate(createAgreementSchema), createAgreement)
  .post( validate(createAgreementSchema), createAgreement)
  .get(getAgreements);

router
  .route('/:id')
//   .patch(restrictTo('Admin'), validate(updateAgreementSchema), updateAgreement);
    .patch( validate(updateAgreementSchema), updateAgreement);
export default router;