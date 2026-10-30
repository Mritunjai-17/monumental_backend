import express from 'express';
import { MarketController } from '../../controllers/market-controller.js';
import { verifyJwtToken } from '../../middlewares/auth-middleware.js';

const router = express.Router();

// Public financial market feeds
router.get('/quote', MarketController.getQuote);
router.get('/history', MarketController.getHistory);
router.get('/capital', MarketController.getCapital);

// Protected corporate capital structure management
router.put('/capital', verifyJwtToken, MarketController.updateCapital);

export default router;

