import { Router } from 'express';
import { CorrelationController } from '../controllers/correlationController';
import { authenticateToken, requireClearance } from '../middleware/auth';

const router = Router();

// All correlation routes require authentication
router.use(authenticateToken);

// POST /api/v1/correlation/analyze - Analyze threats and correlations
router.post('/analyze', CorrelationController.analyzeThreats);

// GET /api/v1/correlation/predictions - Get threat predictions
router.get('/predictions', CorrelationController.getPredictions);

export default router;
