import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Products
export const getProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const getProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const getProductPriceHistory = async (id, days = 90) => {
  const { data } = await api.get(`/products/${id}/price-history`, { params: { days } });
  return data;
};

export const getProductStockHistory = async (id, days = 90) => {
  const { data } = await api.get(`/products/${id}/stock-history`, { params: { days } });
  return data;
};

// Analytics
export const getAnalyticsOverview = async () => {
  const { data } = await api.get('/analytics/overview');
  return data;
};

export const getPriceDistribution = async () => {
  const { data } = await api.get('/analytics/price-distribution');
  return data;
};

export const getStockLevels = async () => {
  const { data } = await api.get('/analytics/stock-levels');
  return data;
};

export const getTopProducts = async (metric = 'price', limit = 10) => {
  const { data } = await api.get('/analytics/top-products', { params: { metric, limit } });
  return data;
};

export const getPriceTimeline = async (days = 30) => {
  const { data } = await api.get('/analytics/price-timeline', { params: { days } });
  return data;
};

export const getStoreStock = async () => {
  const { data } = await api.get('/analytics/store-stock');
  return data;
};

export const getLowStockProducts = async (threshold = 10) => {
  const { data } = await api.get('/analytics/low-stock', { params: { threshold } });
  return data;
};

export default api;
