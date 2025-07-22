import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Search,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity,
  CreditCard,
  Percent,
  Calculator,
  Settings,
  Bell,
  Eye,
  FileText,
  ArrowRight,
  ArrowLeft,
  Zap,
  Shield,
  Target,
  Users,
  Package
} from 'lucide-react';
import axios from 'axios';
import FinancingSettings from '../components/FinancingSettings';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const Financing = () => {
  const [financedOrders, setFinancedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFinancing, setShowAddFinancing] = useState(false);
  const [editingFinancing, setEditingFinancing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalFinanced: 0,
    totalInterest: 0,
    activeFinancing: 0,
    overdueFinancing: 0,
    averageInterestRate: 0,
    totalRevenue: 0
  });

  // Mock data for demonstration
  const mockFinancedOrders = [
    {
      id: 1,
      orderNumber: 'ORD-001',
      customer: {
        company: 'Tech Solutions Inc',
        contact: 'John Smith',
        email: 'john@techsolutions.com'
      },
      originalAmount: 5000,
      financedAmount: 5000,
      interestRate: 1.5,
      interestPeriod: 7,
      startDate: '2024-01-01T00:00:00Z',
      nextInterestDate: '2024-01-08T00:00:00Z',
      totalInterestPaid: 150,
      totalAmountPaid: 2000,
      remainingBalance: 3150,
      status: 'active',
      paymentHistory: [
        { date: '2024-01-08', amount: 150, type: 'interest' },
        { date: '2024-01-15', amount: 150, type: 'interest' },
        { date: '2024-01-22', amount: 150, type: 'interest' },
        { date: '2024-01-29', amount: 150, type: 'interest' },
        { date: '2024-02-05', amount: 150, type: 'interest' },
        { date: '2024-02-12', amount: 150, type: 'interest' },
        { date: '2024-02-19', amount: 150, type: 'interest' },
        { date: '2024-02-26', amount: 150, type: 'interest' },
        { date: '2024-03-04', amount: 150, type: 'interest' },
        { date: '2024-03-11', amount: 150, type: 'interest' }
      ],
      items: [
        { model: 'iPhone 13 Pro', grade: 'A+', capacity: '256GB', quantity: 5, unitPrice: 1000 }
      ]
    },
    {
      id: 2,
      orderNumber: 'ORD-002',
      customer: {
        company: 'Mobile World',
        contact: 'Sarah Johnson',
        email: 'sarah@mobileworld.com'
      },
      originalAmount: 3000,
      financedAmount: 3000,
      interestRate: 1.5,
      interestPeriod: 7,
      startDate: '2024-01-15T00:00:00Z',
      nextInterestDate: '2024-01-22T00:00:00Z',
      totalInterestPaid: 90,
      totalAmountPaid: 1500,
      remainingBalance: 1590,
      status: 'active',
      paymentHistory: [
        { date: '2024-01-22', amount: 45, type: 'interest' },
        { date: '2024-01-29', amount: 45, type: 'interest' },
        { date: '2024-02-05', amount: 45, type: 'interest' },
        { date: '2024-02-12', amount: 45, type: 'interest' },
        { date: '2024-02-19', amount: 45, type: 'interest' },
        { date: '2024-02-26', amount: 45, type: 'interest' },
        { date: '2024-03-04', amount: 45, type: 'interest' },
        { date: '2024-03-11', amount: 45, type: 'interest' }
      ],
      items: [
        { model: 'iPhone 12', grade: 'A', capacity: '128GB', quantity: 3, unitPrice: 1000 }
      ]
    }
  ];

  useEffect(() => {
    fetchFinancedOrders();
    calculateAnalytics();
  }, []);

  const fetchFinancedOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/financing`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        // Transform the data to match our frontend expectations
        const transformedOrders = response.data.data.map(financing => ({
          id: financing.id,
          orderNumber: financing.order?.orderNumber || `FIN-${financing.id}`,
          customer: {
            company: financing.order?.user?.company || 'Unknown Company',
            contact: `${financing.order?.user?.firstName || ''} ${financing.order?.user?.lastName || ''}`.trim() || 'Unknown Contact',
            email: financing.order?.user?.email || 'No email provided'
          },
          originalAmount: financing.order?.totalAmount || 0,
          financedAmount: financing.financedAmount,
          interestRate: financing.interestRate,
          interestPeriod: financing.interestPeriod,
          startDate: financing.startDate,
          nextInterestDate: financing.nextInterestDate,
          totalInterestPaid: financing.totalInterestPaid,
          totalAmountPaid: financing.totalAmountPaid,
          remainingBalance: financing.remainingBalance,
          status: financing.status,
          paymentHistory: financing.payments || [],
          items: financing.order?.items?.map(item => ({
            model: item.productName || 'Unknown Product',
            grade: item.grade || 'Unknown',
            capacity: item.condition || 'Unknown',
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice) || 0
          })) || []
        }));
        setFinancedOrders(transformedOrders);
      } else {
        setFinancedOrders([]);
      }
    } catch (error) {
      console.error('Error fetching financed orders:', error);
      setFinancedOrders([]);
    }
    setLoading(false);
  };

  const calculateAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/financing/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setAnalytics({
          totalFinanced: response.data.data.totalFinanced,
          totalInterest: response.data.data.totalInterest,
          activeFinancing: response.data.data.activeCount,
          overdueFinancing: response.data.data.overdueCount,
          averageInterestRate: response.data.data.averageInterestRate,
          totalRevenue: response.data.data.revenue
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback to local calculation
      const totalFinanced = financedOrders.reduce((sum, order) => sum + order.financedAmount, 0);
      const totalInterest = financedOrders.reduce((sum, order) => sum + order.totalInterestPaid, 0);
      const activeFinancing = financedOrders.filter(order => order.status === 'active').length;
      const overdueFinancing = financedOrders.filter(order => {
        const nextInterestDate = new Date(order.nextInterestDate);
        return nextInterestDate < new Date() && order.status === 'active';
      }).length;
      const averageInterestRate = financedOrders.length > 0 
        ? financedOrders.reduce((sum, order) => sum + order.interestRate, 0) / financedOrders.length 
        : 0;
      const totalRevenue = totalInterest;

      setAnalytics({
        totalFinanced,
        totalInterest,
        activeFinancing,
        overdueFinancing,
        averageInterestRate,
        totalRevenue
      });
    }
  };

  const handleAddFinancing = async (financingData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/financing`, financingData);
      if (response.data.success) {
        setFinancedOrders(prev => [...prev, response.data.data]);
        setShowAddFinancing(false);
        setNotification({ message: 'Financing added successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error adding financing:', error);
      setNotification({ message: 'Failed to add financing', type: 'error' });
    }
  };

  const handleUpdateFinancing = async (financingData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/financing/${financingData.id}`, financingData);
      if (response.data.success) {
        setFinancedOrders(prev => prev.map(f => f.id === financingData.id ? financingData : f));
        setEditingFinancing(null);
        setNotification({ message: 'Financing updated successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error updating financing:', error);
      setNotification({ message: 'Failed to update financing', type: 'error' });
    }
  };

  const handleMarkAsPaid = async (orderId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/financing/${orderId}/mark-paid`);
      if (response.data.success) {
        setFinancedOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: 'paid' } : order
        ));
        setNotification({ message: 'Order marked as paid', type: 'success' });
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      setNotification({ message: 'Failed to mark as paid', type: 'error' });
    }
  };

  const calculateNextInterestDate = (lastDate, period) => {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + period);
    return date.toISOString();
  };

  const calculateInterestAmount = (balance, rate, period) => {
    return balance * (rate / 100) * (period / 365);
  };

  const getFilteredOrders = () => {
    let filtered = financedOrders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.contact.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    if (filterPeriod !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const startDate = new Date(order.startDate);
        const daysDiff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        
        switch (filterPeriod) {
          case '7days': return daysDiff <= 7;
          case '30days': return daysDiff <= 30;
          case '90days': return daysDiff <= 90;
          case 'over90days': return daysDiff > 90;
          default: return true;
        }
      });
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paid': return 'text-blue-400';
      case 'overdue': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20';
      case 'paid': return 'bg-blue-500/20';
      case 'overdue': return 'bg-red-500/20';
      default: return 'bg-zinc-500/20';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-black overflow-y-auto">
      {/* Header */}
      <div className="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-zinc-800 bg-black sticky top-0 z-30">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center text-3xl text-white">
            <CreditCard className="w-8 h-8 mr-3 text-blue-400" />
            <h1 className="text-2xl font-bold">Financing Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddFinancing(true)}
              className="btn-premium flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Financing</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sm:p-7 p-4">
        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="premium-card p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Financed</p>
                <p className="text-xl font-semibold text-white">{formatCurrency(analytics.totalFinanced)}</p>
              </div>
            </div>
          </div>
          
          <div className="premium-card p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Interest</p>
                <p className="text-xl font-semibold text-white">{formatCurrency(analytics.totalInterest)}</p>
              </div>
            </div>
          </div>
          
          <div className="premium-card p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Active Financing</p>
                <p className="text-xl font-semibold text-white">{analytics.activeFinancing}</p>
              </div>
            </div>
          </div>
          
          <div className="premium-card p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Overdue</p>
                <p className="text-xl font-semibold text-white">{analytics.overdueFinancing}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-premium pl-10 w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-premium w-full"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Period</label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="input-premium w-full"
            >
              <option value="all">All Periods</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="over90days">Over 90 Days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Actions</label>
            <button
              onClick={() => {/* Export data */}}
              className="btn-premium w-full flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Financed Orders List */}
        <div className="space-y-4">
          {getFilteredOrders().map(order => (
            <div key={order.id} className="premium-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{order.orderNumber}</h3>
                      <p className="text-zinc-400">{order.customer.company} • {order.customer.contact}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(order.status)} ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-zinc-300 mb-2">Financial Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Original Amount:</span>
                          <span className="text-white">{formatCurrency(order.originalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Financed Amount:</span>
                          <span className="text-white">{formatCurrency(order.financedAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Interest Rate:</span>
                          <span className="text-white">{order.interestRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Period:</span>
                          <span className="text-white">{order.interestPeriod} days</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-zinc-300 mb-2">Payment Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Total Paid:</span>
                          <span className="text-green-400">{formatCurrency(order.totalAmountPaid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Interest Paid:</span>
                          <span className="text-blue-400">{formatCurrency(order.totalInterestPaid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Remaining:</span>
                          <span className="text-red-400">{formatCurrency(order.remainingBalance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Next Interest:</span>
                          <span className="text-white">{formatDate(order.nextInterestDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-zinc-300 mb-2">Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            <div className="text-white">{item.model}</div>
                            <div className="text-zinc-400">
                              {item.grade} • {item.capacity} • Qty: {item.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Payment History */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-zinc-300 mb-2">Recent Payment History</h4>
                    <div className="space-y-2">
                      {order.paymentHistory.slice(-5).map((payment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-zinc-800/30 rounded">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              payment.type === 'interest' ? 'bg-blue-400' : 'bg-green-400'
                            }`}></div>
                            <span className="text-sm text-zinc-300">{formatDate(payment.date)}</span>
                            <span className="text-xs text-zinc-400">({payment.type})</span>
                          </div>
                          <span className="text-sm text-white">{formatCurrency(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setEditingFinancing(order)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                    title="Edit Financing"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMarkAsPaid(order.id)}
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-colors"
                    title="Mark as Paid"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {/* View details */}}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Financing Modal */}
      {(showAddFinancing || editingFinancing) && (
        <FinancingForm
          financing={editingFinancing}
          onSave={editingFinancing ? handleUpdateFinancing : handleAddFinancing}
          onCancel={() => {
            setShowAddFinancing(false);
            setEditingFinancing(null);
          }}
          title={editingFinancing ? 'Edit Financing' : 'Add New Financing'}
        />
      )}

      {/* Settings Modal */}
      <FinancingSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={(settings) => {
          console.log('Settings saved:', settings);
          setNotification({ message: 'Financing settings updated', type: 'success' });
        }}
      />
    </div>
  );
};

// Financing Form Component
const FinancingForm = ({ financing, onSave, onCancel, title }) => {
  const [formData, setFormData] = useState({
    orderNumber: financing?.orderNumber || '',
    customer: financing?.customer || { company: '', contact: '', email: '' },
    originalAmount: financing?.originalAmount || 0,
    financedAmount: financing?.financedAmount || 0,
    interestRate: financing?.interestRate || 1.5,
    interestPeriod: financing?.interestPeriod || 7,
    startDate: financing?.startDate ? new Date(financing.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    items: financing?.items || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const financingData = {
      ...formData,
      nextInterestDate: calculateNextInterestDate(formData.startDate, formData.interestPeriod),
      totalInterestPaid: 0,
      totalAmountPaid: 0,
      remainingBalance: formData.financedAmount,
      status: 'active',
      paymentHistory: [],
      ...(financing?.id && { id: financing.id })
    };
    onSave(financingData);
  };

  const calculateNextInterestDate = (startDate, period) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + period);
    return date.toISOString();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="premium-card p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onCancel}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Order Number</label>
              <input
                type="text"
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                className="input-premium w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input-premium w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Original Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.originalAmount}
                onChange={(e) => setFormData({ ...formData, originalAmount: parseFloat(e.target.value) || 0 })}
                className="input-premium w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Financed Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.financedAmount}
                onChange={(e) => setFormData({ ...formData, financedAmount: parseFloat(e.target.value) || 0 })}
                className="input-premium w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
                className="input-premium w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Interest Period (days)</label>
              <input
                type="number"
                value={formData.interestPeriod}
                onChange={(e) => setFormData({ ...formData, interestPeriod: parseInt(e.target.value) || 0 })}
                className="input-premium w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Company</label>
              <input
                type="text"
                value={formData.customer.company}
                onChange={(e) => setFormData({
                  ...formData,
                  customer: { ...formData.customer, company: e.target.value }
                })}
                className="input-premium w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Contact</label>
              <input
                type="text"
                value={formData.customer.contact}
                onChange={(e) => setFormData({
                  ...formData,
                  customer: { ...formData.customer, contact: e.target.value }
                })}
                className="input-premium w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.customer.email}
                onChange={(e) => setFormData({
                  ...formData,
                  customer: { ...formData.customer, email: e.target.value }
                })}
                className="input-premium w-full"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Financing</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Financing; 