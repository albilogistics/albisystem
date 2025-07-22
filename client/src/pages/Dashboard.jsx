import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import axios from 'axios';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Activity, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Package,
  Target,
  Globe,
  Smartphone,
  TrendingDown,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const loadingTimer = setTimeout(() => setIsLoading(false), 1000);
    
    fetchDashboardData();
    
    return () => {
      clearInterval(timer);
      clearTimeout(loadingTimer);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Remove authentication requirement for development
      // const token = localStorage.getItem('token');
      // const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch orders data without authentication
      const ordersResponse = await axios.get('http://localhost:3001/api/orders');
      const orders = ordersResponse.data.success ? ordersResponse.data.data : [];

      // Fetch financing analytics without authentication
      const financingResponse = await axios.get('http://localhost:3001/api/financing/analytics');
      const financingData = financingResponse.data.success ? financingResponse.data.data : {};

      // Calculate metrics
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
      const thisMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      });
      const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
      
      // Calculate profit (simplified - revenue minus estimated costs)
      const estimatedCosts = totalRevenue * 0.7; // Assume 70% cost
      const netProfit = totalRevenue - estimatedCosts;
      
      // Calculate margin rate
      const marginRate = totalRevenue > 0 ? ((totalRevenue - estimatedCosts) / totalRevenue) * 100 : 0;

      setKpiMetrics([
        { 
          icon: DollarSign, 
          value: `$${totalRevenue.toLocaleString()}`, 
          label: 'Total Revenue', 
          diff: 12.8, 
          color: 'blue',
          trend: 'up',
          description: 'Total revenue from all orders'
        },
        { 
          icon: TrendingUp, 
          value: `$${netProfit.toLocaleString()}`, 
          label: 'Net Profit', 
          diff: 15.2, 
          color: 'green',
          trend: 'up',
          description: 'Profit after estimated costs'
        },
        { 
          icon: ShoppingCart, 
          value: orders.length.toString(), 
          label: 'Total Orders', 
          diff: 8.5, 
          color: 'purple',
          trend: 'up',
          description: 'Total orders processed'
        },
        { 
          icon: Target, 
          value: `${marginRate.toFixed(1)}%`, 
          label: 'Margin Rate', 
          diff: 2.1, 
          color: 'orange',
          trend: 'up',
          description: 'Average profit margin'
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Set default metrics if API calls fail
      setKpiMetrics([
        { 
          icon: DollarSign, 
          value: '$0', 
          label: 'Total Revenue', 
          diff: 0, 
          color: 'blue',
          trend: 'up',
          description: 'Total revenue from all orders'
        },
        { 
          icon: TrendingUp, 
          value: '$0', 
          label: 'Net Profit', 
          diff: 0, 
          color: 'green',
          trend: 'up',
          description: 'Profit after estimated costs'
        },
        { 
          icon: ShoppingCart, 
          value: '0', 
          label: 'Total Orders', 
          diff: 0, 
          color: 'purple',
          trend: 'up',
          description: 'Total orders processed'
        },
        { 
          icon: Target, 
          value: '0%', 
          label: 'Margin Rate', 
          diff: 0, 
          color: 'orange',
          trend: 'up',
          description: 'Average profit margin'
        },
      ]);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const response = await axios.post('http://localhost:3001/api/sync/manual');
      
      if (response.data.success) {
        setLastSyncTime(new Date());
        console.log('Sync completed successfully');
      } else {
        console.error('Sync failed:', response.data.error);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const [kpiMetrics, setKpiMetrics] = useState([
    { 
      icon: DollarSign, 
      value: '$0', 
      label: 'Total Revenue', 
      diff: 0, 
      color: 'blue',
      trend: 'up',
      description: 'Monthly revenue growth'
    },
    { 
      icon: TrendingUp, 
      value: '$0', 
      label: 'Net Profit', 
      diff: 0, 
      color: 'green',
      trend: 'up',
      description: 'Profit after expenses'
    },
    { 
      icon: ShoppingCart, 
      value: '0', 
      label: 'Total Orders', 
      diff: 0, 
      color: 'purple',
      trend: 'up',
      description: 'Orders this month'
    },
    { 
      icon: Target, 
      value: '0%', 
      label: 'Margin Rate', 
      diff: 0, 
      color: 'orange',
      trend: 'up',
      description: 'Average margin'
    },
  ]);

  const recentOrders = [
    { 
      id: '#ORD-001', 
      customer: 'John Smith', 
      product: 'iPhone 13 Pro', 
      amount: '$899.99', 
      status: 'completed',
      date: '2 min ago',
      market: 'US'
    },
    { 
      id: '#ORD-002', 
      customer: 'Maria Garcia', 
      product: 'Samsung Galaxy S21', 
      amount: '$749.99', 
      status: 'processing',
      date: '15 min ago',
      market: 'VE'
    },
    { 
      id: '#ORD-003', 
      customer: 'David Chen', 
      product: 'iPhone 12', 
      amount: '$699.99', 
      status: 'shipped',
      date: '1 hour ago',
      market: 'US'
    },
    { 
      id: '#ORD-004', 
      customer: 'Lisa Johnson', 
      product: 'Google Pixel 6', 
      amount: '$599.99', 
      status: 'pending',
      date: '2 hours ago',
      market: 'VE'
    },
  ];

  const marketStats = [
    {
      market: 'US',
      revenue: '$45,230',
      orders: 634,
      margin: '92.1%',
      growth: 18.5,
      color: 'blue'
    },
    {
      market: 'VE',
      revenue: '$36,680',
      orders: 613,
      margin: '96.3%',
      growth: 7.2,
      color: 'green'
    }
  ];

  const recentActivities = [
    { 
      type: 'price_update', 
      message: 'iPhone 13 Pro price updated', 
      time: '2 min ago', 
      status: 'success',
      icon: Zap
    },
    { 
      type: 'sync', 
      message: 'Venezuela market synchronized', 
      time: '5 min ago', 
      status: 'info',
      icon: TrendingUp
    },
    { 
      type: 'inventory', 
      message: 'New inventory items added', 
      time: '10 min ago', 
      status: 'warning',
      icon: ShoppingCart
    },
    { 
      type: 'order', 
      message: 'New order received from US market', 
      time: '15 min ago', 
      status: 'success',
      icon: Package
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-blue-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'success': return 'bg-green-500/20';
      case 'warning': return 'bg-yellow-500/20';
      case 'error': return 'bg-red-500/20';
      case 'info': return 'bg-blue-500/20';
      default: return 'bg-zinc-500/20';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'processing': return 'text-blue-400 bg-blue-400/10';
      case 'shipped': return 'text-purple-400 bg-purple-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-zinc-400 bg-zinc-400/10';
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Clock;
      case 'shipped': return Package;
      case 'pending': return AlertCircle;
      default: return XCircle;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow bg-black overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-black overflow-y-auto">
      {/* Premium Header */}
      <div className="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-zinc-800/50 bg-black sticky top-0 z-30">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Dashboard Overview</h1>
              <p className="text-zinc-400 text-sm">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="premium-card px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Live</span>
              </div>
            </div>
            <div className="premium-card px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-blue-500'} rounded-full`}></div>
                <span className="text-sm text-blue-400">
                  {isSyncing ? 'Syncing...' : `Last Sync: ${lastSyncTime.toLocaleTimeString()}`}
                </span>
              </div>
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="premium-card px-4 py-2 hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center space-x-2">
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="text-sm text-blue-400">Sync Now</span>
              </div>
            </button>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-premium text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sm:p-7 p-4 space-y-6">
        {/* KPI Cards - Premium Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiMetrics.map((m, i) => (
            <div key={i} className="premium-card-hover">
              <MetricCard 
                icon={m.icon} 
                value={m.value} 
                label={m.label} 
                diff={m.diff} 
                color={m.color}
                description={m.description}
                trend={m.trend}
              />
            </div>
          ))}
        </div>
        
        {/* Market Performance & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Performance */}
          <div className="premium-card p-6 premium-card-hover">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Market Performance</h3>
                <p className="text-zinc-400 text-sm">Revenue and margin by market</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            
            <div className="space-y-4">
              {marketStats.map((market, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full bg-${market.color}-500`}></div>
                    <div>
                      <h4 className="text-white font-medium">{market.market} Market</h4>
                      <p className="text-zinc-400 text-sm">{market.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{market.revenue}</p>
                    <p className={`text-sm ${market.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {market.growth > 0 ? '+' : ''}{market.growth}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="premium-card p-6 premium-card-hover">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
                <p className="text-zinc-400 text-sm">Latest customer orders</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-400" />
              </div>
            </div>
            
            <div className="space-y-3">
              {recentOrders.map((order, index) => {
                const StatusIcon = getOrderStatusIcon(order.status);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${getStatusBg(order.status)} rounded-lg flex items-center justify-center`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{order.id}</p>
                        <p className="text-zinc-400 text-xs">{order.customer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-medium">{order.amount}</p>
                      <p className="text-zinc-400 text-xs">{order.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Charts Section - Premium Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart Card */}
          <div className="premium-card p-6 premium-card-hover">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
                <p className="text-zinc-400 text-sm">Monthly revenue trends</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                </div>
                <span className="text-zinc-400 text-sm">Chart visualization coming soon</span>
              </div>
            </div>
          </div>

          {/* Product Performance */}
          <div className="premium-card p-6 premium-card-hover">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Top Products</h3>
                <p className="text-zinc-400 text-sm">Best performing devices</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="space-y-4">
              {[
                { name: 'iPhone 13 Pro', sales: 234, revenue: '$210,600' },
                { name: 'Samsung Galaxy S21', sales: 189, revenue: '$141,750' },
                { name: 'iPhone 12', sales: 156, revenue: '$109,200' },
                { name: 'Google Pixel 6', sales: 98, revenue: '$58,800' }
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{product.name}</p>
                      <p className="text-zinc-400 text-xs">{product.sales} units sold</p>
                    </div>
                  </div>
                  <p className="text-white text-sm font-medium">{product.revenue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <p className="text-zinc-400 text-sm">Latest system updates and changes</p>
            </div>
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/30 hover:bg-zinc-800/50 transition-all duration-300">
                  <div className={`w-10 h-10 ${getStatusBg(activity.status)} rounded-xl flex items-center justify-center mr-4`}>
                    <Icon className={`w-5 h-5 ${getStatusColor(activity.status)}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{activity.message}</p>
                    <p className="text-zinc-400 text-xs">{activity.time}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`badge-${activity.status === 'success' ? 'success' : activity.status === 'warning' ? 'warning' : 'info'}`}>
                      {activity.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="premium-card p-6 premium-card-hover cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">Sync Prices</h4>
                <p className="text-zinc-400 text-sm">Update all pricing data</p>
              </div>
              <ArrowUpRight className="w-6 h-6 text-zinc-400 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>

          <div className="premium-card p-6 premium-card-hover cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">Export Data</h4>
                <p className="text-zinc-400 text-sm">Download reports</p>
              </div>
              <ArrowDownRight className="w-6 h-6 text-zinc-400 group-hover:text-green-400 transition-colors" />
            </div>
          </div>

          <div className="premium-card p-6 premium-card-hover cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">Analytics</h4>
                <p className="text-zinc-400 text-sm">View detailed insights</p>
              </div>
              <BarChart3 className="w-6 h-6 text-zinc-400 group-hover:text-purple-400 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 