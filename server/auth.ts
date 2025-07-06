import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { User } from '@shared/schema';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET || 'botmaster-jwt-secret';
const JWT_EXPIRY = '24h';

// Generate JWT token
export function generateToken(user: User) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// Extend Express session interface
declare module 'express-session' {
  export interface SessionData {
    user?: {
      id: string;
      role: string;
    };
  }
}

// Extend Request interface to include userId and userRole
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

// Middleware to authenticate requests using session cookies or JWT tokens
export function isAuthenticated(req: any, res: Response, next: NextFunction) {
  try {
    // First try session authentication
    if (req.session && req.session.user) {
      req.userId = req.session.user.id;
      req.userRole = req.session.user.role;
      return next();
    }
    
    // Fall back to JWT token authentication from cookies
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      req.userId = decoded.id;
      req.userRole = decoded.role;
      return next();
    }
    
    return res.status(401).json({ message: 'Authentication required' });
  } catch (error) {
    return res.status(401).json({ message: 'Authentication error' });
  }
}

// Middleware to check if user is admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  storage.getUser(req.userId)
    .then(user => {
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    })
    .catch(error => {
      console.error('Error in isAdmin middleware:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
