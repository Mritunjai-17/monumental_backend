import { NewsRepository } from '../repository/news-repository.js';
import { ApiError } from '../utils/api-error.js';

export class NewsService {
  constructor() {
    this.newsRepository = new NewsRepository();
  }

  async getNews(category, includeDrafts = false) {
    return await this.newsRepository.getPublishedNews(category, includeDrafts);
  }

  async getNewsBySlug(slug) {
    const news = await this.newsRepository.findBySlug(slug);
    if (!news) {
      throw new ApiError(`News article '${slug}' not found`, 404);
    }
    return news;
  }

  async createNews(data) {
    if (!data.title || !data.title.trim()) {
      throw new ApiError('Headline title is required', 400);
    }

    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    }

    if (!data.excerpt && data.content) {
      const cleanText = data.content.replace(/<[^>]*>?/gm, '');
      data.excerpt = cleanText.slice(0, 180) + '...';
    }

    if (!data.date) {
      data.date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    const existing = await this.newsRepository.findBySlug(data.slug);
    if (existing) {
      data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
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
