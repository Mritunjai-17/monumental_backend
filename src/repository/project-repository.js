import { BaseRepository } from './base-repository.js';
import { Project } from '../models/project-model.js';

export class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  async getProjects(filter = {}) {
    return await this.model.find({ isActive: true, ...filter }).sort({ featured: -1, createdAt: -1 });
  }

  async findBySlug(slug) {
    return await this.model.findOne({ slug: slug.toLowerCase() });
  }
}

