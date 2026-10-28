import { ProjectService } from '../services/project-service.js';
import { successResponse } from '../utils/success-response.js';

const projectService = new ProjectService();

export class ProjectController {
  static async getProjects(req, res, next) {
    try {
      const { commodity, country } = req.query;
      const filter = {};
      if (commodity) filter.commodity = commodity;
      if (country) filter.country = country;
      const projects = await projectService.getAllProjects(filter);
      return successResponse(res, 200, 'Projects retrieved successfully', projects);
    } catch (error) {
      next(error);
    }
  }

  static async getProjectBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const project = await projectService.getProjectBySlug(slug);
      return successResponse(res, 200, 'Project retrieved successfully', project);
    } catch (error) {
      next(error);
    }
  }

  static async createProject(req, res, next) {
    try {
      const created = await projectService.createProject(req.body);
      return successResponse(res, 201, 'Project created successfully', created);
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await projectService.updateProject(id, req.body);
      return successResponse(res, 200, 'Project updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      await projectService.deleteProject(id);
      return successResponse(res, 200, 'Project deleted successfully', { id });
    } catch (error) {
      next(error);
    }
  }
}

