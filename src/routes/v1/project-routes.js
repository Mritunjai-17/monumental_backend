import express from 'express';
import { ProjectController } from '../../controllers/project-controller.js';
import { verifyJwtToken } from '../../middlewares/auth-middleware.js';

const router = express.Router();

router.get('/', ProjectController.getProjects);
router.get('/:slug', ProjectController.getProjectBySlug);
router.post('/', verifyJwtToken, ProjectController.createProject);
router.put('/:id', verifyJwtToken, ProjectController.updateProject);
router.delete('/:id', verifyJwtToken, ProjectController.deleteProject);

export default router;

