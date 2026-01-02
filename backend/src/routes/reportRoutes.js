// routes/foreclosedRoutes.js
import express from 'express';
import { generateForeclosedReport,
     generateAccidentReport, 
     generateMaintenanceReport, 
     generateMaintenanceTypeReport, 
     generateSingleVehicleMaintenanceReport,
     generateFuelExpenseReport,
generateGeneratorMaintenanceReport } from '../controllers/reportController.js';

const router = express.Router();

// Examples:
// /api/v1/report/foreclosed?period=monthly&format=pdf
// /api/v1/report/foreclosed?startDate=2025-01-01&endDate=2025-12-31&format=excel
// /api/v1/report/foreclosed?period=quarterly
router.get('/foreclosed', generateForeclosedReport);

// Accident Report
// Examples:
// /api/v1/reports/accident?period=monthly&format=pdf
// /api/v1/reports/accident?startDate=2005-01-01&endDate=2025-12-31&format=excel
// /api/v1/reports/accident?period=yearly&format=word
router.get('/accident', generateAccidentReport);

router.get('/maintenance', generateMaintenanceReport);
router.get('/maintenance-type', generateMaintenanceTypeReport);

// Single Vehicle Maintenance History Jacket Report
// Example: /api/v1/reports/maintenance-jacket/ET-12345?format=pdf
router.get('/maintenance-jacket/:plateNo', generateSingleVehicleMaintenanceReport);

// Fuel Expense Report
router.get('/fuel-expense', generateFuelExpenseReport);

router.get('/generator-maintenance', generateGeneratorMaintenanceReport);
export default router;