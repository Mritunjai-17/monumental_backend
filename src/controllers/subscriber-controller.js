import { SubscriberService } from '../services/subscriber-service.js';
import { successResponse } from '../utils/success-response.js';

const subscriberService = new SubscriberService();

export class SubscriberController {
  static async getSubscribers(req, res, next) {
    try {
      const { status, search } = req.query;
      const subscribers = await subscriberService.getAllSubscribers(status, search);
      return successResponse(res, 200, 'Subscribers fetched successfully', subscribers);
    } catch (error) {
      next(error);
    }
  }

  static async subscribe(req, res, next) {
    try {
      const { email, source } = req.body;
      const result = await subscriberService.subscribe(email, source);
      return successResponse(
        res,
        201,
        'Thank you for subscribing to Monumental Energy news alerts.',
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await subscriberService.updateStatus(id, status);
      return successResponse(res, 200, 'Subscriber status updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubscriber(req, res, next) {
    try {
      const { id } = req.params;
      await subscriberService.deleteSubscriber(id);
      return successResponse(res, 200, 'Subscriber deleted successfully', { id });
    } catch (error) {
      next(error);
    }
  }
}

