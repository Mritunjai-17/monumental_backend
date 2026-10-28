import { BaseRepository } from './base-repository.js';
import { Enquiry } from '../models/enquiry-model.js';

export class EnquiryRepository extends BaseRepository {
  constructor() {
    super(Enquiry);
  }

  async getAllEnquiries(statusFilter, roleFilter, searchQuery) {
    const query = {};
    if (statusFilter && statusFilter !== 'All') {
      query.status = new RegExp(`^${statusFilter}$`, 'i');
    }
    if (roleFilter && roleFilter !== 'All') {
      query.role = roleFilter;
    }
    if (searchQuery && searchQuery.trim()) {
      const regex = new RegExp(searchQuery.trim(), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { subject: regex },
        { message: regex },
        { enquiryId: regex },
        { role: regex }
      ];
    }
    return await this.model.find(query).sort({ createdAt: -1 });
  }

  async updateStatus(id, status, notes) {
    const update = { status };
    if (notes !== undefined) update.notes = notes;
    return await this.updateById(id, update);
  }
}
