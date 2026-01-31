import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    agency: string;
    clearance_level: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access token required'
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'JWT secret not configured'
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Invalid or expired token'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    req.user = decoded as any;
    next();
  });
};

export const requireClearance = (requiredLevel: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const clearanceLevels = {
      'UNCLASSIFIED': 1,
      'RESTRICTED': 2,
      'CONFIDENTIAL': 3,
      'SECRET': 4
    };

    const userLevel = clearanceLevels[req.user?.clearance_level as keyof typeof clearanceLevels] || 0;
    const required = clearanceLevels[requiredLevel as keyof typeof clearanceLevels] || 0;

    if (userLevel < required) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_CLEARANCE',
          message: `Requires ${requiredLevel} clearance level`
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};
