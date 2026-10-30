import express from 'express';
import authRoutes from './auth-routes.js';
import enquiryRoutes from './enquiry-routes.js';
import subscriberRoutes from './subscriber-routes.js';
import projectRoutes from './project-routes.js';
import newsRoutes from './news-routes.js';
import statsRoutes from './stats-routes.js';
import marketRoutes from './market-routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/enquiry', enquiryRoutes);
router.use('/contact', enquiryRoutes);
router.use('/subscribers', subscriberRoutes);
router.use('/subscriber', subscriberRoutes);
router.use('/newsletter', subscriberRoutes);
router.use('/projects', projectRoutes);
router.use('/news', newsRoutes);
router.use('/stats', statsRoutes);
router.use('/market', marketRoutes);

export default router;
