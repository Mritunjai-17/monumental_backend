import { SubscriberRepository } from '../repository/subscriber-repository.js';
import { ApiError } from '../utils/api-error.js';

export class SubscriberService {
  constructor() {
    this.subscriberRepository = new SubscriberRepository();
  }

  async getAllSubscribers(status, search) {
    return await this.subscriberRepository.getAllSubscribers(status, search);
  }

  async subscribe(email, source = 'Website News Alerts Form') {
    if (!email) {
      throw new ApiError('Email address is required', 400);
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
    if (!emailRegex.test(email.trim())) {
      throw new ApiError('Please provide a valid email address', 400);
    }

    const existing = await this.subscriberRepository.findByEmail(email);
    if (existing) {
      if (existing.status === 'Unsubscribed') {
        existing.status = 'Active';
        existing.subscribedAt = new Date();
        await existing.save();
        return { subscriber: existing, isReactivated: true };
      }
      return { subscriber: existing, alreadySubscribed: true };
    }

    const subscriber = await this.subscriberRepository.create({
      email: email.toLowerCase().trim(),
      source,
      status: 'Active'
    });

    return { subscriber, created: true };
  }

  async updateStatus(id, status) {
    const updated = await this.subscriberRepository.updateStatus(id, status);
    if (!updated) {
      throw new ApiError(`Subscriber with id ${id} not found`, 404);
    }
    return updated;
  }

  async deleteSubscriber(id) {
    const deleted = await this.subscriberRepository.deleteById(id);
    if (!deleted) {
      throw new ApiError(`Subscriber with id ${id} not found`, 404);
    }
    return deleted;
  }
}

