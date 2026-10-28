import { AuthService } from '../services/auth-service.js';
import { successResponse } from '../utils/success-response.js';

const authService = new AuthService();

export class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return successResponse(res, 200, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, 201, 'User registered successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      return successResponse(res, 200, 'Profile retrieved', { user: req.user });
    } catch (error) {
      next(error);
    }
  }
}

