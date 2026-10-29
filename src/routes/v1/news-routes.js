import express from 'express';
import { NewsController } from '../../controllers/news-controller.js';
import { verifyJwtToken } from '../../middlewares/auth-middleware.js';
import { uploadPdf } from '../../middlewares/upload-middleware.js';

const router = express.Router();

router.get('/', NewsController.getNews);
router.get('/:slug', NewsController.getNewsBySlug);
router.post('/upload-pdf', verifyJwtToken, uploadPdf.single('pdf'), NewsController.uploadAndParsePdf);
router.post('/', verifyJwtToken, NewsController.createNews);
router.put('/:id', verifyJwtToken, NewsController.updateNews);
router.delete('/:id', verifyJwtToken, NewsController.deleteNews);

export default router;
