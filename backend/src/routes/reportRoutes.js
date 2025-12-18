// routes/foreclosedRoutes.js
import express from 'express';
import { generateForeclosedReport, generateAccidentReport} from '../controllers/reportController.js';

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

export default router;