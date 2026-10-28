import { Enquiry } from '../models/enquiry-model.js';
import { Subscriber } from '../models/subscriber-model.js';
import { Project } from '../models/project-model.js';
import { News } from '../models/news-model.js';
import { successResponse } from '../utils/success-response.js';

export class StatsController {
  static async getDashboardStats(req, res, next) {
    try {
      const [
        totalInquiries,
        newInquiries,
        totalSubscribers,
        activeSubscribers,
        totalProjects,
        totalNews
      ] = await Promise.all([
        Enquiry.countDocuments(),
        Enquiry.countDocuments({ status: 'New' }),
        Subscriber.countDocuments(),
        Subscriber.countDocuments({ status: 'Active' }),
        Project.countDocuments(),
        News.countDocuments()
      ]);

      const recentInquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(5);
      const recentSubscribers = await Subscriber.find().sort({ createdAt: -1 }).limit(5);

      return successResponse(res, 200, 'Dashboard statistics fetched successfully', {
        counts: {
          totalInquiries,
          newInquiries,
          totalSubscribers,
          activeSubscribers,
          totalProjects,
          totalNews
        },
        recentInquiries,
        recentSubscribers
      });
    } catch (error) {
      next(error);
    }
  }
}

