import { Router } from 'express';
import {
    getSuppliers,
    getSupplier,
    addSupplier,
    editSupplier,
    removeSupplier
} from './supplier.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getSuppliers);                            // all roles
router.get('/:id', getSupplier);                            // all roles
router.post('/', authorize('admin', 'manager'), addSupplier);
router.patch('/:id', authorize('admin', 'manager'), editSupplier);
router.delete('/:id', authorize('admin'), removeSupplier);

export default router;