import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { sendMessageSchema } from './messages.schema.js';
import { sendMessage, getHistory } from './messages.controller.js';

// mergeParams: true allows us to access req.params.roomId from parent router
const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', validate(sendMessageSchema), sendMessage);
router.get('/', getHistory);

export default router;
