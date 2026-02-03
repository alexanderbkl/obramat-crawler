import api from './client';

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Products
export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getFeatured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getCategories: () => api.get('/products/categories'),
  getCategoryBySlug: (slug) => api.get(`/products/categories/${slug}`),
  // Admin only
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Cart
export const cartApi = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
  merge: (items) => api.post('/cart/merge', { items }),
};

// Orders
export const ordersApi = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  create: (data) => api.post('/orders', data),
  createCheckoutSession: (id) => api.post(`/orders/${id}/checkout`),
};

// Addresses
export const addressesApi = {
  getAll: () => api.get('/orders/user/addresses'),
  create: (data) => api.post('/orders/user/addresses', data),
  update: (id, data) => api.put(`/orders/user/addresses/${id}`, data),
  delete: (id) => api.delete(`/orders/user/addresses/${id}`),
};

export default api;
