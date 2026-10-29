import fs from 'fs';
import { NewsService } from '../services/news-service.js';
import { successResponse } from '../utils/success-response.js';
import { parsePressReleasePDF } from '../utils/pdf-parser.js';
import { ApiError } from '../utils/api-error.js';

const newsService = new NewsService();

export class NewsController {
  static async getNews(req, res, next) {
    try {
      const { category, includeDrafts } = req.query;
      const news = await newsService.getNews(category, includeDrafts === 'true');
      return successResponse(res, 200, 'News retrieved successfully', news);
    } catch (error) {
      next(error);
    }
  }

  static async getNewsBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const article = await newsService.getNewsBySlug(slug);
      return successResponse(res, 200, 'News article retrieved successfully', article);
    } catch (error) {
      next(error);
    }
  }

  static async createNews(req, res, next) {
    try {
      const created = await newsService.createNews(req.body);
      return successResponse(res, 201, 'News article published successfully', created);
    } catch (error) {
      next(error);
    }
  }

  static async updateNews(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await newsService.updateNews(id, req.body);
      return successResponse(res, 200, 'News article updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  static async deleteNews(req, res, next) {
    try {
      const { id } = req.params;
      await newsService.deleteNews(id);
      return successResponse(res, 200, 'News article deleted successfully', { id });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PDF Ingestion: Uploads PDF, parses text, and returns structured data for CMS auto-fill
   */
  static async uploadAndParsePdf(req, res, next) {
    try {
      if (!req.file) {
        throw new ApiError('Please upload a valid PDF file', 400);
      }

      const fileBuffer = fs.readFileSync(req.file.path);
      const parsed = await parsePressReleasePDF(fileBuffer);
      const pdfUrl = `/uploads/news/${req.file.filename}`;

      return successResponse(res, 200, 'PDF extracted and parsed successfully', {
        ...parsed,
        pdfUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size
      });
    } catch (error) {
      next(error);
    }
  }
}
