import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, LoginRequest, AuthResponse } from '../types/auth';

export class AuthController {
  // Mock user database (replace with real database later)
  private static users: User[] = [
    {
      id: '1',
      username: 'nis_analyst',
      email: 'analyst@nis.go.ke',
      agency: 'NIS',
      clearance_level: 'SECRET',
      role: 'ANALYST',
      is_active: true,
      created_at: new Date(),
    },
    {
      id: '2',
      username: 'dci_operator',
      email: 'operator@dci.go.ke',
      agency: 'DCI',
      clearance_level: 'CONFIDENTIAL',
      role: 'OPERATOR',
      is_active: true,
      created_at: new Date(),
    }
  ];

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, agency }: LoginRequest = req.body;

      // Validate input
      if (!username || !password || !agency) {
        res.status(400).json({
          success: false,
          message: 'Username, password, and agency are required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Find user
      const user = AuthController.users.find(
        u => u.username === username && u.agency === agency
      );

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // For demo purposes, accept any password
      // In production, use: await bcrypt.compare(password, user.password_hash)

      // Generate tokens with type assertion
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET not configured');
        res.status(500).json({
          success: false,
          message: 'Server configuration error',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Create payload
      const payload = { 
        user_id: user.id, 
        agency: user.agency, 
        clearance_level: user.clearance_level 
      };

      // Generate tokens using type assertion to bypass TypeScript issues
      const access_token = (jwt as any).sign(
        payload,
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      ) as string;

      const refresh_token = (jwt as any).sign(
        { user_id: user.id },
        jwtSecret,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
      ) as string;

      const response: AuthResponse = {
        success: true,
        data: {
          access_token,
          refresh_token,
          user,
          expires_in: 15 * 60 // 15 minutes
        },
        message: 'Login successful',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // In production, invalidate the token
      res.status(200).json({
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
}
