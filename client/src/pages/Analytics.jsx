import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    orders: {
      total: 0,
      pending: 0,
      paid: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    },
    revenue: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    financing: {
      totalFinanced: 0,
      totalInterest: 0,
      activeFinancing: 0,
      overdueFinancing: 0
    },
    products: {
      total: 0,
      lowStock: 0,
      outOfStock: 0
    },
    priceHistory: {
      totalChanges: 0,
      priceIncreases: 0,
      priceDecreases: 0,
      averageChange: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch orders data
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, { headers });
      const orders = ordersResponse.data.success ? ordersResponse.data.data : [];

      // Fetch financing analytics
      const financingResponse = await axios.get(`${API_BASE_URL}/financing/analytics`, { headers });
      const financingData = financingResponse.data.success ? financingResponse.data.data : {};

      // Fetch products data
      const productsResponse = await axios.get(`${API_BASE_URL}/products`, { headers });
      const products = productsResponse.data.success ? productsResponse.data.data : [];

      // Fetch price history analytics
      const priceHistoryResponse = await axios.get(`${API_BASE_URL}/price-history/analytics?dateRange=${selectedPeriod}`, { headers });
      const priceHistoryData = priceHistoryResponse.data.success ? priceHistoryResponse.data.data : {};

      // Calculate order statistics
      const orderStats = {
        total: orders.length,
        pending: orders.filter(order => order.status === 'pending').length,
        paid: orders.filter(order => order.status === 'paid').length,
        shipped: orders.filter(order => order.status === 'shipped').length,
        delivered: orders.filter(order => order.status === 'delivered').length,
        cancelled: orders.filter(order => order.status === 'cancelled').length
      };

      // Calculate revenue
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
      const thisMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      });
      const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

      // Calculate product statistics
      const productStats = {
        total: products.length,
        lowStock: products.filter(product => (product.quantity || 0) < 10 && (product.quantity || 0) > 0).length,
        outOfStock: products.filter(product => (product.quantity || 0) === 0).length
      };

      setAnalytics({
        orders: orderStats,
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthRevenue,
          lastMonth: 0, // Would need historical data
          growth: 0 // Would need historical data
        },
        financing: {
          totalFinanced: financingData.totalFinanced || 0,
          totalInterest: financingData.totalInterest || 0,
          activeFinancing: financingData.activeCount || 0,
          overdueFinancing: financingData.overdueCount || 0
        },
        products: productStats,
        priceHistory: {
          totalChanges: priceHistoryData.totalChanges || 0,
          priceIncreases: priceHistoryData.priceIncreases || 0,
          priceDecreases: priceHistoryData.priceDecreases || 0,
          averageChange: priceHistoryData.averageChange || 0
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setNotification({ message: 'Failed to load analytics data', type: 'error' });
    }
    setLoading(false);
  }, [selectedPeriod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };



  return (
    <div className="flex-grow bg-black overflow-y-auto">
      {/* Header */}
      <div className="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-zinc-800 bg-black sticky top-0 z-30">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center text-3xl text-white">
            <BarChart3 className="w-8 h-8 mr-3 text-blue-400" />
            <h1 className="text-2xl font-bold">Analytics</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-zinc-800 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sm:p-7 p-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
            <span className="ml-2 text-zinc-400">Loading analytics...</span>
          </div>
        ) : (
          <>
            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Total Revenue</h3>
                    <p className="text-zinc-400 text-sm">All time</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">{formatCurrency(analytics.revenue.total)}</div>
              </div>

              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">This Month</h3>
                    <p className="text-zinc-400 text-sm">Revenue</p>
                  </div>
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-400">{formatCurrency(analytics.revenue.thisMonth)}</div>
              </div>

              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Total Orders</h3>
                    <p className="text-zinc-400 text-sm">All time</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">{analytics.orders.total}</div>
              </div>

              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Financing Revenue</h3>
                    <p className="text-zinc-400 text-sm">Interest earned</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-orange-400">{formatCurrency(analytics.financing.totalInterest)}</div>
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Status Breakdown */}
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Order Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-zinc-300">Pending</span>
                    </div>
                    <span className="text-white font-semibold">{analytics.orders.pending}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-zinc-300">Paid</span>
                    </div>
                    <span className="text-white font-semibold">{analytics.orders.paid}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-zinc-300">Shipped</span>
                    </div>
                    <span className="text-white font-semibold">{analytics.orders.shipped}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-teal-500 rounded-full mr-3"></div>
                      <span className="text-zinc-300">Delivered</span>
                    </div>
                    <span className="text-white font-semibold">{analytics.orders.delivered}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-zinc-300">Cancelled</span>
                    </div>
                    <span className="text-white font-semibold">{analytics.orders.cancelled}</span>
                  </div>
                </div>
              </div>

              {/* Financing Overview */}
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Financing Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Total Financed</span>
                    <span className="text-white font-semibold">{formatCurrency(analytics.financing.totalFinanced)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Active Financing</span>
                    <span className="text-white font-semibold">{analytics.financing.activeFinancing}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Overdue Financing</span>
                    <span className="text-red-400 font-semibold">{analytics.financing.overdueFinancing}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Interest Revenue</span>
                    <span className="text-green-400 font-semibold">{formatCurrency(analytics.financing.totalInterest)}</span>
                  </div>
                </div>
              </div>

              {/* Product Inventory */}
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Product Inventory</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Total Products</span>
                    <span className="text-white font-semibold">{analytics.products.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Low Stock</span>
                    <span className="text-yellow-400 font-semibold">{analytics.products.lowStock}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Out of Stock</span>
                    <span className="text-red-400 font-semibold">{analytics.products.outOfStock}</span>
                  </div>
                </div>
              </div>

              {/* Price History */}
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Price Changes ({selectedPeriod})</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Total Changes</span>
                    <span className="text-white font-semibold">{analytics.priceHistory.totalChanges}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Price Increases</span>
                    <span className="text-red-400 font-semibold">{analytics.priceHistory.priceIncreases}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Price Decreases</span>
                    <span className="text-green-400 font-semibold">{analytics.priceHistory.priceDecreases}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Avg Change</span>
                    <span className="text-white font-semibold">{formatCurrency(analytics.priceHistory.averageChange)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {analytics.orders.total > 0 ? formatPercentage(analytics.orders.paid, analytics.orders.total) : '0%'}
                  </div>
                  <div className="text-zinc-400 text-sm">Order Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {analytics.products.total > 0 ? formatPercentage(analytics.products.total - analytics.products.outOfStock, analytics.products.total) : '0%'}
                  </div>
                  <div className="text-zinc-400 text-sm">Inventory Availability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {analytics.financing.totalFinanced > 0 ? formatPercentage(analytics.financing.totalInterest, analytics.financing.totalFinanced) : '0%'}
                  </div>
                  <div className="text-zinc-400 text-sm">Financing ROI</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Notification */}
      {notification.message && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Analytics; 