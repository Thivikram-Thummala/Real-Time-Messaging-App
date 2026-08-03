import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

/**
 * POST /api/v1/auth/register
 * Creates a new user account and returns a JWT.
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);

  res.status(201).json({
    success: true,
    data: result
  });
});

/**
 * POST /api/v1/auth/login
 * Verifies credentials and returns a JWT.
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * GET /api/v1/auth/me
 * Returns the profile of the authenticated user.
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await AuthService.getProfile(req.user!.userId);

  res.status(200).json({
    success: true,
    data: profile
  });
});

/**
 * PUT /api/v1/auth/me
 * Updates the profile of the authenticated user.
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) {
    res.status(400).json({ success: false, message: 'Username is required' });
    return;
  }
  const profile = await AuthService.updateProfile(req.user!.userId, username);

  res.status(200).json({
    success: true,
    data: profile
  });
});
