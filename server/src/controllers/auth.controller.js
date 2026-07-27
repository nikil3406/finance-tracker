import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body || {};
  const result = await authService.registerUser({ username, email, password });
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body || {};
  const result = await authService.loginUser({ usernameOrEmail, password });
  res.json(result);
});
