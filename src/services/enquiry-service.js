import { EnquiryRepository } from '../repository/enquiry-repository.js';
import { ApiError } from '../utils/api-error.js';
import { EmailService } from './email-service.js';

export class EnquiryService {
  constructor() {
    this.enquiryRepository = new EnquiryRepository();
    this.emailService = new EmailService();
  }

  async getAllEnquiries(status, role, search) {
    return await this.enquiryRepository.getAllEnquiries(status, role, search);
  }

  async getEnquiryById(id) {
    const enquiry = await this.enquiryRepository.getById(id);
    if (!enquiry) {
      throw new ApiError(`Enquiry with id ${id} not found`, 404);
    }
    return enquiry;
  }

  async createEnquiry(data) {
    if (!data.name || !data.name.trim()) {
      throw new ApiError('Please provide your full name', 400);
    }
    if (!data.email || !data.email.trim()) {
      throw new ApiError('Email address is required', 400);
    }
    if (!data.message || !data.message.trim()) {
      throw new ApiError('Message is required', 400);
    }
    if (data.message.trim().length < 10) {
      throw new ApiError('Message must be at least 10 characters long', 400);
    }

    const payload = {
      role: data.role || 'Prospective Investor',
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone ? data.phone.trim() : '',
      subject: data.subject ? data.subject.trim() : '',
      message: data.message.trim(),
      source: data.source || 'Investor Contact Form',
      status: 'New'
    };

    const created = await this.enquiryRepository.create(payload);

    // 1. Dispatch internal admin notification to the IR team
    this.emailService.sendAdminInquiryNotification(created).catch((err) => {
      console.error('[EnquiryService] Failed to dispatch admin inquiry notification:', err.message);
    });

    // 2. Dispatch auto-reply Thank You email to the person who submitted the form
    this.emailService.sendThankYouEmail(created).catch((err) => {
      console.error('[EnquiryService] Failed to dispatch thank you auto-reply:', err.message);
    });

    return created;
  }

  async updateStatus(id, status, notes) {
    const updated = await this.enquiryRepository.updateStatus(id, status, notes);
    if (!updated) {
      throw new ApiError(`Enquiry with id ${id} not found`, 404);
    }
    return updated;
  }

  async deleteEnquiry(id) {
    const deleted = await this.enquiryRepository.deleteById(id);
    if (!deleted) {
      throw new ApiError(`Enquiry with id ${id} not found`, 404);
    }
    return deleted;
  }
}
