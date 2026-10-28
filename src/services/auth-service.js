import jwt from 'jsonwebtoken';
import { UserRepository } from '../repository/user-repository.js';
import { ServerConfig } from '../config/server-config.js';
import { ApiError } from '../utils/api-error.js';

export class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  generateToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      ServerConfig.JWT_SECRET,
      { expiresIn: ServerConfig.JWT_EXPIRES_IN }
    );
  }

  async login(email, password) {
    if (!email || !password) {
      throw new ApiError('Email and password are required', 400);
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError('Invalid email or password', 401);
    }

    const token = this.generateToken(user);
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async register(userData) {
    const existing = await this.userRepository.findByEmail(userData.email);
    if (existing) {
      throw new ApiError('User with this email already exists', 409);
    }
    const user = await this.userRepository.create(userData);
    const token = this.generateToken(user);
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }
}

