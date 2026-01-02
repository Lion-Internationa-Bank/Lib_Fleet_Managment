// backend/src/routes/reminderRoutes.js
import express from 'express';
// import { protect, restrictTo } from '../middleware/auth.js';
import { getActiveReminders } from '../controllers/reminderController.js';

const router = express.Router();

// router.use(protect); 


// router.get('/active', restrictTo('Admin', 'PFO', 'CustomerService'), getActiveReminders);
router.get('/active', getActiveReminders);

export default router;