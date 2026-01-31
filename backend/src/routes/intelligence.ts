import { Router } from 'express';
import { IntelligenceController } from '../controllers/intelligenceController';
import { authenticateToken, requireClearance } from '../middleware/auth';

const router = Router();

// All intelligence routes require authentication
router.use(authenticateToken);

// POST /api/v1/intelligence/submit - Submit new intelligence
router.post('/submit', IntelligenceController.submitIntelligence);

// GET /api/v1/intelligence/search - Search intelligence reports
router.get('/search', IntelligenceController.searchIntelligence);

// GET /api/v1/intelligence/:id - Get specific intelligence report
router.get('/:id', IntelligenceController.getIntelligenceById);

export default router;
