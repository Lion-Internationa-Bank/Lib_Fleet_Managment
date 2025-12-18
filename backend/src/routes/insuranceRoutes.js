import express from "express";
import {
  createInsurance,
  getInsurances,
  updateInsurance,
} from "../controllers/insuranceController.js";
// import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createInsuranceSchema,
  updateInsuranceSchema,
} from "../validators/insuranceValidator.js";

const router = express.Router();

// Protect and restrict to Admin only
// router.use(protect);
// router.use(restrictTo("Admin"));

router
  .route("/")
  .post(validate(createInsuranceSchema), createInsurance)
  .get(getInsurances);

router
  .route("/:id")
  .patch(validate(updateInsuranceSchema), updateInsurance);

export default router;