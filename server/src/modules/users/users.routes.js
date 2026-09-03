import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { pool } from '../../config/database.js';
import { searchUsers } from '../../database/queries/users.js';

const router = Router();

router.use(authenticate);

/**
 * GET /api/v1/users/search?q=username
 * Search registered users by username or email.
 */
router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const query = req.query.q || '';
    const result = await searchUsers(pool, query);
    res.status(200).json({
      success: true,
      data: result.rows
    });
  })
);

export default router;
