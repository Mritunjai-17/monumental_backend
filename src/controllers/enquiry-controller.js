import { EnquiryService } from '../services/enquiry-service.js';
import { successResponse } from '../utils/success-response.js';

const enquiryService = new EnquiryService();

export class EnquiryController {
  static async getEnquiries(req, res, next) {
    try {
      const { status, role, search } = req.query;
      const enquiries = await enquiryService.getAllEnquiries(status, role, search);
      return successResponse(res, 200, 'Enquiries fetched successfully', enquiries);
    } catch (error) {
      next(error);
    }
  }

  static async getEnquiry(req, res, next) {
    try {
      const { id } = req.params;
      const enquiry = await enquiryService.getEnquiryById(id);
      return successResponse(res, 200, 'Enquiry retrieved successfully', enquiry);
    } catch (error) {
      next(error);
    }
  }

  static async createEnquiry(req, res, next) {
    try {
      // Honeypot spam check from InvestorContactForm.tsx
      if (req.body.honeypot) {
        return successResponse(res, 200, 'Inquiry submitted successfully', {});
      }
      const created = await enquiryService.createEnquiry(req.body);
      return successResponse(res, 201, 'Inquiry submitted successfully', created);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const updated = await enquiryService.updateStatus(id, status, notes);
      return successResponse(res, 200, 'Enquiry status updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  static async deleteEnquiry(req, res, next) {
    try {
      const { id } = req.params;
      await enquiryService.deleteEnquiry(id);
      return successResponse(res, 200, 'Enquiry deleted successfully', { id });
    } catch (error) {
      next(error);
    }
  }
}
