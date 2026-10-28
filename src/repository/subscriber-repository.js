import { BaseRepository } from './base-repository.js';
import { Subscriber } from '../models/subscriber-model.js';

export class SubscriberRepository extends BaseRepository {
  constructor() {
    super(Subscriber);
  }

  async getAllSubscribers(statusFilter, searchQuery) {
    const query = {};
    if (statusFilter && statusFilter !== 'All') {
      query.status = new RegExp(`^${statusFilter}$`, 'i');
    }
    if (searchQuery && searchQuery.trim()) {
      const regex = new RegExp(searchQuery.trim(), 'i');
      query.$or = [
        { email: regex },
        { subscriberId: regex },
        { source: regex }
      ];
    }
    return await this.model.find(query).sort({ subscribedAt: -1, createdAt: -1 });
  }

  async findByEmail(email) {
    return await this.model.findOne({ email: email.toLowerCase().trim() });
  }

  async updateStatus(id, status) {
    return await this.updateById(id, { status });
  }
}

