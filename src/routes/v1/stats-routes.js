import express from 'express';
import { StatsController } from '../../controllers/stats-controller.js';
import { verifyJwtToken } from '../../middlewares/auth-middleware.js';

const router = express.Router();

router.get('/', verifyJwtToken, StatsController.getDashboardStats);

export default router;

