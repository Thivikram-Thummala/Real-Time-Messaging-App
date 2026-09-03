import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createRoomSchema } from './rooms.schema.js';
import {
  createRoom,
  getUserRooms,
  getRoomById,
  addMember,
  leaveRoom,
  removeMember
} from './rooms.controller.js';

const router = Router();

// Apply authenticate middleware to all room routes
router.use(authenticate);

router.post('/', validate(createRoomSchema), createRoom);
router.get('/', getUserRooms);
router.get('/:roomId', getRoomById);
router.post('/:roomId/members', addMember);
router.post('/:roomId/leave', leaveRoom);
router.delete('/:roomId/members/:userId', removeMember);

export default router;
