import { EnquiryRepository } from '../repository/enquiry-repository.js';
import { ApiError } from '../utils/api-error.js';

export class EnquiryService {
  constructor() {
    this.enquiryRepository = new EnquiryRepository();
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

    return await this.enquiryRepository.create(payload);
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
