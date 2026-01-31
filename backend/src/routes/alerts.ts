import { Router } from 'express';
import { AlertsController } from '../controllers/alertsController';
import { authenticateToken, requireClearance } from '../middleware/auth';

const router = Router();

// All alerts routes require authentication
router.use(authenticateToken);

// POST /api/v1/alerts/create - Create new threat alert
router.post('/create', AlertsController.createAlert);

// GET /api/v1/alerts - Get alerts
router.get('/', AlertsController.getAlerts);

// POST /api/v1/alerts/:id/acknowledge - Acknowledge alert
router.post('/:id/acknowledge', AlertsController.acknowledgeAlert);

export default router;
