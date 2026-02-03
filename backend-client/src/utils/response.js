// Standard API response format
export const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
});

export const errorResponse = (message = 'An error occurred', errors = null) => ({
  success: false,
  message,
  errors,
  data: null,
});

export const paginatedResponse = (data, pagination, message = 'Success') => ({
  success: true,
  message,
  data,
  pagination,
});

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};
