import { BaseRepository } from './base-repository.js';
import { News } from '../models/news-model.js';

export class NewsRepository extends BaseRepository {
  constructor() {
    super(News);
  }

  async getPublishedNews(category) {
    const query = { isPublished: true };
    if (category && category !== 'All') {
      query.category = category;
    }
    return await this.model.find(query).sort({ publishedAt: -1 });
  }

  async findBySlug(slug) {
    return await this.model.findOne({ slug: slug.toLowerCase() });
  }
}

