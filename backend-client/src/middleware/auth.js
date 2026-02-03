import { verifyAccessToken } from '../utils/jwt.js';
import { errorResponse, HTTP_STATUS } from '../utils/response.js';
import prisma from '../db/prisma.js';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.accessToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('Authentication required')
      );
    }
    
    const decoded = verifyAccessToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('User not found')
      );
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('Token expired', { code: 'TOKEN_EXPIRED' })
      );
    }
    
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse('Invalid token')
    );
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return next();
    }
    
    const decoded = verifyAccessToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Token invalid but that's okay for optional auth
    next();
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      errorResponse('Admin access required')
    );
  }
  next();
};
