import { ProjectRepository } from '../repository/project-repository.js';
import { ApiError } from '../utils/api-error.js';

export class ProjectService {
  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  async getAllProjects(filter) {
    return await this.projectRepository.getProjects(filter);
  }

  async getProjectBySlug(slug) {
    const project = await this.projectRepository.findBySlug(slug);
    if (!project) {
      throw new ApiError(`Project '${slug}' not found`, 404);
    }
    return project;
  }

  async createProject(data) {
    if (!data.slug && data.title) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    const existing = await this.projectRepository.findBySlug(data.slug);
    if (existing) {
      throw new ApiError(`Project with slug '${data.slug}' already exists`, 409);
    }
    return await this.projectRepository.create(data);
  }

  async updateProject(id, updateData) {
    const updated = await this.projectRepository.updateById(id, updateData);
    if (!updated) {
      throw new ApiError(`Project with id ${id} not found`, 404);
    }
    return updated;
  }

  async deleteProject(id) {
    const deleted = await this.projectRepository.deleteById(id);
    if (!deleted) {
      throw new ApiError(`Project with id ${id} not found`, 404);
    }
    return deleted;
  }
}

