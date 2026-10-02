import { AuthService } from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { logger } from '../../utils/logger.js';

/**
 * POST /api/v1/auth/register
 * Creates a new user account and returns a JWT.
 */
export const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body);

  logger.info(
    { userId: result.user.id, email: result.user.email, username: result.user.username },
    `New user registered [${result.user.email}] (ID: ${result.user.id})`
  );

  res.status(201).json({
    success: true,
    data: result
  });
});

/**
 * POST /api/v1/auth/login
 * Verifies credentials and returns a JWT.
 */
export const login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body);

  logger.info(
    { userId: result.user.id, email: result.user.email, username: result.user.username },
    `User [${result.user.email}] (ID: ${result.user.id}) logged in successfully`
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * GET /api/v1/auth/me
 * Returns the profile of the authenticated user.
 */
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await AuthService.getProfile(req.user.userId);

  logger.debug(
    { userId: req.user.userId },
    `Session restored for User [${profile.email || req.user.userId}]`
  );

  res.status(200).json({
    success: true,
    data: profile
  });
});

/**
 * PUT /api/v1/auth/me
 * Updates the profile of the authenticated user.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) {
    res.status(400).json({ success: false, message: 'Username is required' });
    return;
  }
  const profile = await AuthService.updateProfile(req.user.userId, username);

  logger.info(
    { userId: req.user.userId, newUsername: username },
    `User (ID: ${req.user.userId}) updated profile username to [${username}]`
  );

  res.status(200).json({
    success: true,
    data: profile
  });
});
