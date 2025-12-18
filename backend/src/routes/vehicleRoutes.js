// backend/src/routes/vehicleRoutes.js
import express from 'express';
// import { protect, restrictTo } from '../middleware/auth.js';
import {
  createVehicle,
  getAllVehicles,
  getVehicleByPlateNo,
  updateVehicleFull,
  updateVehicleLocation,
  updateVehicleCompliance,
} from '../controllers/vehicleController.js';

const router = express.Router();


// router.use(protect);


router
  .route('/')
//   .get(restrictTo('Admin', 'PFO', 'CustomerService'), getAllVehicles) //with roles
  .get(getAllVehicles)  // without role  
//   .post(restrictTo('PFO'), createVehicle); 
.post( createVehicle); 

// Single vehicle by plate_no
router
  .route('/:plateNo')
//   .get(restrictTo('Admin', 'PFO', 'CustomerService'), getVehicleByPlateNo)
  .get(getVehicleByPlateNo)
//   .put(restrictTo('Admin'), updateVehicleFull); // Full update only Admin
.put( updateVehicleFull); // Full update only Admin

// Partial updates
// router.patch(
//   '/:plateNo/location',
//   restrictTo('Admin', 'PFO'),
//   updateVehicleLocation
// );

router.patch(
  '/:plateNo/location',
  updateVehicleLocation
);

// router.patch(
//   '/:plateNo/compliance',
//   restrictTo('Admin', 'CustomerService'),
//   updateVehicleCompliance
// );

router.patch(
  '/:plateNo/compliance',
  updateVehicleCompliance
);


export default router;
