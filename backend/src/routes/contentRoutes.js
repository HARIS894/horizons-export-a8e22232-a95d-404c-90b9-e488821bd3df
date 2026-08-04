import { Router } from 'express';
import { contentController } from '../controllers/contentController.js';

const router = Router();

router.get('/healthcare-library', contentController.libraryDataset);
router.get('/search', contentController.search);

export default router;