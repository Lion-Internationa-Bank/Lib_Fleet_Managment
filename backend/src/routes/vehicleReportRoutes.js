// // routes/vehicleRoutes.js
// import express from 'express';
// import { generateVehicleReport } from '../controllers/vehicleReportController.js';

// const router = express.Router();

// // Generate report: /api/v1/vehicles/report/all/excel
// //                 /api/v1/vehicles/report/Nairobi/pdf
// //                 /api/v1/vehicles/report/Addis%20Ababa/excel
// router.get('/vehicles/:location/:format', generateVehicleReport);

// // Optional: default to excel if format not provided
// router.get('/vehicles/:location', generateVehicleReport); // defaults to excel

// export default router;