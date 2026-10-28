import { NewsRepository } from '../repository/news-repository.js';
import { ApiError } from '../utils/api-error.js';

export class NewsService {
  constructor() {
    this.newsRepository = new NewsRepository();
  }

  async getNews(category) {
    return await this.newsRepository.getPublishedNews(category);
  }

  async getNewsBySlug(slug) {
    const news = await this.newsRepository.findBySlug(slug);
    if (!news) {
      throw new ApiError(`News article '${slug}' not found`, 404);
    }
    return news;
  }

  async createNews(data) {
    if (!data.slug && data.title) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    const existing = await this.newsRepository.findBySlug(data.slug);
    if (existing) {
      throw new ApiError(`News with slug '${data.slug}' already exists`, 409);
    }
    return await this.newsRepository.create(data);
  }

  async updateNews(id, updateData) {
    const updated = await this.newsRepository.updateById(id, updateData);
    if (!updated) {
      throw new ApiError(`News with id ${id} not found`, 404);
    }
    return updated;
  }

  async deleteNews(id) {
    const deleted = await this.newsRepository.deleteById(id);
    if (!deleted) {
      throw new ApiError(`News with id ${id} not found`, 404);
    }
    return deleted;
  }
}

