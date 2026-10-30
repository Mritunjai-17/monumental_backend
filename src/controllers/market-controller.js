import { MarketService } from '../services/market-service.js';
import { successResponse } from '../utils/success-response.js';

const marketService = new MarketService();

export class MarketController {
  static async getQuote(req, res, next) {
    try {
      const quote = await marketService.getLiveQuote();
      return successResponse(res, 200, 'Market quote retrieved successfully', quote);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const { timeframe = '5D' } = req.query;
      const history = await marketService.getChartHistory(timeframe);
      return successResponse(res, 200, `Market history for ${timeframe.toUpperCase()} retrieved successfully`, {
        timeframe: timeframe.toUpperCase(),
        symbol: 'TSX-V: MNRG',
        currency: 'CAD',
        count: history.length,
        points: history
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCapital(req, res, next) {
    try {
      const capital = await marketService.getCapitalStructure();
      return successResponse(res, 200, 'Corporate capital structure retrieved successfully', capital);
    } catch (error) {
      next(error);
    }
  }

  static async updateCapital(req, res, next) {
    try {
      const updated = await marketService.updateCapitalStructure(req.body, req.user?.email);
      return successResponse(res, 200, 'Corporate capital structure updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }
}

