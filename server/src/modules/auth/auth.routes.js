import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { register, login, getProfile, updateProfile } from './auth.controller.js';

const router = Router();

// Public routes (no auth required)
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected route (requires valid JWT)
router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);

export default router;
