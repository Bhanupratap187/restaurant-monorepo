
import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUserStatus,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// All user routes require authentication and staff management permission
router.use(authenticate);
router.use(authorize(['MANAGE_STAFF']));

const userParamsSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
};

const updateStatusSchema = {
  body: z.object({
    isActive: z.boolean(),
  }),
};

router.get('/', getUsers);
router.get('/:id', validate(userParamsSchema), getUserById);
router.patch(
  '/:id/status',
  validate({ ...userParamsSchema, ...updateStatusSchema }),
  updateUserStatus
);

export default router;