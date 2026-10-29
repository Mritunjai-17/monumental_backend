import express from 'express';
import { AuthController } from '../../controllers/auth-controller.js';
import { verifyJwtToken } from '../../middlewares/auth-middleware.js';

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/profile', verifyJwtToken, AuthController.getProfile);
router.get('/me', verifyJwtToken, AuthController.getProfile);

export default router;
