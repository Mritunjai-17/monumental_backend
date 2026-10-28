import express from 'express';
import v1ApiRoutes from './v1/index.js';
import { EnquiryController } from '../controllers/enquiry-controller.js';
import { SubscriberController } from '../controllers/subscriber-controller.js';

const router = express.Router();

// Direct aliases for frontend integration
router.post('/contact', EnquiryController.createEnquiry);
router.post('/newsletter', SubscriberController.subscribe);
router.post('/subscribe', SubscriberController.subscribe);

// API v1 versioned routes
router.use('/v1', v1ApiRoutes);

export default router;
