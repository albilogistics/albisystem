// API Configuration for different environments
const getApiUrl = () => {
  // Use environment variable if available (production)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default to localhost for development
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiUrl();

// API endpoints
export const API_ENDPOINTS = {
  ORDERS: `${API_BASE_URL}/api/orders`,
  FINANCING_ANALYTICS: `${API_BASE_URL}/api/financing/analytics`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  CART: `${API_BASE_URL}/api/cart`,
  SETTINGS: `${API_BASE_URL}/api/settings`,
  INVOICES: `${API_BASE_URL}/api/invoices`,
};

export default API_BASE_URL; 