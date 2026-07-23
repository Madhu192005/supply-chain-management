import { Router } from 'express';
import { getAnalytics } from './analytics.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize('admin', 'manager'), getAnalytics);

export default router;
