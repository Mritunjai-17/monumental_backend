import express from 'express';
import { SubscriberController } from '../../controllers/subscriber-controller.js';
import { verifyJwtToken } from '../../middlewares/auth-middleware.js';

const router = express.Router();

router.get('/', verifyJwtToken, SubscriberController.getSubscribers);
router.post('/', SubscriberController.subscribe);
router.patch('/:id/status', verifyJwtToken, SubscriberController.updateStatus);
router.delete('/:id', verifyJwtToken, SubscriberController.deleteSubscriber);

export default router;

