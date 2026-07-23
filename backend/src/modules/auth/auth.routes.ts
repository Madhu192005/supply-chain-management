import { Router } from 'express';
import { register, login, getMe, getUsers, toggleUser } from './auth.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', login);

router.get('/me', authenticate, getMe);

router.post('/register', authenticate, authorize('admin'), register);
router.get('/users', authenticate, authorize('admin'), getUsers);
router.patch('/users/:id/toggle', authenticate, authorize('admin'), toggleUser);

export default router;