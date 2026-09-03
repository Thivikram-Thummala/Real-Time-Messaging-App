import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/database.js';
import { config } from '../../config/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { createUser, findByEmail, findById } from '../../database/queries/users.js';

export class AuthService {
  /**
   * Register a new user.
   * 1. Check if email is already taken
   * 2. Hash the password with bcrypt (10 salt rounds)
   * 3. Insert user into the database
   * 4. Sign and return a JWT token
   */
  static async register(input) {
    const { username, email, password, avatarUrl } = input;

    // Check for existing email
    const existingEmail = await findByEmail(pool, email);
    if (existingEmail.rows.length > 0) {
      throw new AppError(409, 'Email already in use');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
      const result = await createUser(pool, username, email, passwordHash, avatarUrl);
      const user = result.rows[0];

      const token = this.generateToken(user.id, user.email);

      // Strip password_hash from the response
      const { password_hash, ...userProfile } = user;
      return { user: userProfile, token };
    } catch (err) {
      // PostgreSQL unique constraint violation
      if (err.code === '23505') {
        if (err.constraint?.includes('username')) {
          throw new AppError(409, 'Username already in use');
        }
        throw new AppError(409, 'Email or Username already in use');
      }
      throw err;
    }
  }

  /**
   * Login an existing user.
   * 1. Find user by email
   * 2. Compare password hash with bcrypt
   * 3. Return JWT token
   */
  static async login(input) {
    const { email, password } = input;

    const result = await findByEmail(pool, email);
    const user = result.rows[0];

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email);

    const { password_hash, ...userProfile } = user;
    return { user: userProfile, token };
  }

  /**
   * Get the profile of the currently authenticated user.
   */
  static async getProfile(userId) {
    const result = await findById(pool, userId);
    const user = result.rows[0];

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  /**
   * Update the profile of the currently authenticated user.
   */
  static async updateProfile(userId, username) {
    try {
      const { updateProfileQuery } = await import('../../database/queries/users.js');
      const result = await updateProfileQuery(pool, userId, username);
      const user = result.rows[0];

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      return user;
    } catch (err) {
      if (err.code === '23505') {
        throw new AppError(409, 'Username already in use');
      }
      throw err;
    }
  }

  /**
   * Sign a JWT with the user's ID and email.
   */
  static generateToken(userId, email) {
    return jwt.sign({ userId, email }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN
    });
  }
}
