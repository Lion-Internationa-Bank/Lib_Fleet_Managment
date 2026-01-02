// backend/src/routes/maintenanceRoutes.js
import express from 'express';
// import { protect, restrictTo } from '../middleware/auth.js';
import {
  createVehicleMaintenance,
  getAllVehicleMaintenances,
  getVehicleMaintenanceHistory,
  updateVehicleMaintenance,
  createGeneratorService,
  getAllGeneratorServices,
  getGeneratorServiceHistory,
  updateGeneratorService,
} from '../controllers/maintenanceController.js';
import { validate } from '../middleware/validate.js';
import { createVehicleMaintenanceSchema,updateVehicleMaintenanceSchema,createGeneratorServiceSchema,updateGeneratorServiceSchema, } from '../validators/maintenanceValidator.js';

const router = express.Router();

// All routes require login
// router.use(protect);

// ==================== VEHICLE MAINTENANCE ====================
router
  .route('/vehicles')
//   .post(restrictTo('PFO'),validate(createVehicleMaintenanceSchema), createVehicleMaintenance)
     .post(validate(createVehicleMaintenanceSchema), createVehicleMaintenance)
//   .get(restrictTo('Admin', 'PFO'), getAllVehicleMaintenances);
     .get( getAllVehicleMaintenances);

router
  .route('/vehicles/:id')
//   .patch(restrictTo('Admin', 'PFO'),validate(updateVehicleMaintenanceSchema), updateVehicleMaintenance);
.patch(validate(updateVehicleMaintenanceSchema), updateVehicleMaintenance); 

// router.get('/vehicles/history/:plateNo', restrictTo('Admin', 'PFO'), getVehicleMaintenanceHistory);
router.get('/vehicles/history/:plateNo', getVehicleMaintenanceHistory);



// ==================== GENERATOR MAINTENANCE ====================
router
  .route('/generators')
//   .post(restrictTo('PFO'),validate(createGeneratorServiceSchema), createGeneratorService)
     .post(validate(createGeneratorServiceSchema), createGeneratorService)
//   .get(restrictTo('Admin', 'PFO'), getAllGeneratorServices);
     .get(getAllGeneratorServices);

router
  .route('/generators/:id')
//   .patch(restrictTo('Admin', 'PFO'), updateGeneratorService);
     .patch( updateGeneratorService);

// router.get('/generators/history/:generatorId', restrictTo('Admin', 'PFO'),validate(updateGeneratorServiceSchema), getGeneratorServiceHistory);
   router.get('/generators/history/:generatorId', getGeneratorServiceHistory);

export default router;