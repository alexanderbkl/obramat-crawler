import { authService } from '../services/auth.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../utils/response.js';
import { config } from '../config/index.js';

const setTokenCookies = (res, accessToken, refreshToken) => {
  // Set access token cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearTokenCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

export const authController = {
  async register(req, res) {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);
      
      setTokenCookies(res, accessToken, refreshToken);
      
      res.status(HTTP_STATUS.CREATED).json(
        successResponse({ user, accessToken }, 'Registration successful')
      );
    } catch (error) {
      if (error.message === 'User already exists') {
        return res.status(HTTP_STATUS.CONFLICT).json(
          errorResponse(error.message)
        );
      }
      
      console.error('Register error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Registration failed')
      );
    }
  },

  async login(req, res) {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body);
      
      setTokenCookies(res, accessToken, refreshToken);
      
      res.json(
        successResponse({ user, accessToken }, 'Login successful')
      );
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          errorResponse(error.message)
        );
      }
      
      console.error('Login error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Login failed')
      );
    }
  },

  async refresh(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      
      if (!refreshToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          errorResponse('Refresh token required')
        );
      }
      
      const { user, accessToken, refreshToken: newRefreshToken } = 
        await authService.refreshToken(refreshToken);
      
      setTokenCookies(res, accessToken, newRefreshToken);
      
      res.json(
        successResponse({ user, accessToken }, 'Token refreshed')
      );
    } catch (error) {
      clearTokenCookies(res);
      
      if (error.message.includes('expired') || error.message.includes('Invalid')) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          errorResponse(error.message, { code: 'REFRESH_TOKEN_INVALID' })
        );
      }
      
      console.error('Refresh error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Token refresh failed')
      );
    }
  },

  async logout(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      
      await authService.logout(refreshToken);
      clearTokenCookies(res);
      
      res.json(
        successResponse(null, 'Logout successful')
      );
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear cookies even if logout fails
      clearTokenCookies(res);
      res.json(
        successResponse(null, 'Logout successful')
      );
    }
  },

  async logoutAll(req, res) {
    try {
      await authService.logoutAll(req.user.id);
      clearTokenCookies(res);
      
      res.json(
        successResponse(null, 'Logged out from all devices')
      );
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Logout failed')
      );
    }
  },

  async getProfile(req, res) {
    try {
      const user = await authService.getProfile(req.user.id);
      
      res.json(
        successResponse(user)
      );
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get profile')
      );
    }
  },

  async updateProfile(req, res) {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);
      
      res.json(
        successResponse(user, 'Profile updated')
      );
    } catch (error) {
      if (error.message === 'Email already in use') {
        return res.status(HTTP_STATUS.CONFLICT).json(
          errorResponse(error.message)
        );
      }
      
      console.error('Update profile error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to update profile')
      );
    }
  },

  async changePassword(req, res) {
    try {
      await authService.changePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword
      );
      
      clearTokenCookies(res);
      
      res.json(
        successResponse(null, 'Password changed. Please login again.')
      );
    } catch (error) {
      if (error.message === 'Current password is incorrect') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse(error.message)
        );
      }
      
      console.error('Change password error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to change password')
      );
    }
  },
};
