import { errorResponse, HTTP_STATUS } from '../utils/response.js';

export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error.errors) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse('Validation failed', formattedErrors)
        );
      }
      
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Invalid request data')
      );
    }
  };
};

export const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error.errors) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse('Invalid query parameters', formattedErrors)
        );
      }
      
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Invalid query parameters')
      );
    }
  };
};

export const validateParams = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error.errors) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse('Invalid parameters', formattedErrors)
        );
      }
      
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Invalid parameters')
      );
    }
  };
};
