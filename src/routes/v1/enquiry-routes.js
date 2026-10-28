import express from 'express';
import { EnquiryController } from '../../controllers/enquiry-controller.js';
import { verifyJwtToken } from '../../middlewares/auth-middleware.js';

const router = express.Router();

router.get('/', verifyJwtToken, EnquiryController.getEnquiries);
router.get('/:id', verifyJwtToken, EnquiryController.getEnquiry);
router.post('/', EnquiryController.createEnquiry);
router.patch('/:id/status', verifyJwtToken, EnquiryController.updateStatus);
router.delete('/:id', verifyJwtToken, EnquiryController.deleteEnquiry);

export default router;

