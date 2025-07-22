import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  Truck, 
  User, 
  Calendar,
  MoreVertical,
  Edit3,
  Eye,
  Trash2,
  AlertCircle,
  Plus,
  Filter,
  Search,
  X,
  Download,
  FileText
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showOrderEditor, setShowOrderEditor] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFinancing, setFilterFinancing] = useState('all');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const statuses = [
    { key: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' },
    { key: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
    { key: 'paid', label: 'Paid', icon: DollarSign, color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30' },
    { key: 'fulfilled', label: 'Fulfilled', icon: Truck, color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' },
    { key: 'cancelled', label: 'Cancelled', icon: X, color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`);
      if (response.data.success) {
        // Transform backend data to match frontend expectations
        const transformedOrders = response.data.data.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customer: {
            company: order.user?.company || 'Unknown Company',
            contact: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Unknown Contact',
            email: order.user?.email || 'No email provided'
          },
          items: order.items?.map(item => ({
            model: item.productName || 'Unknown Product',
            grade: item.grade || 'Unknown',
            capacity: item.condition || 'Unknown',
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice) || 0
          })) || [],
          paymentDueDate: order.paymentDueDate,
          remindersEnabled: order.remindersEnabled,
          subtotal: parseFloat(order.totalAmount) || 0,
          fees: [], // Backend doesn't have fees yet
          total: parseFloat(order.totalAmount) || 0,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }));
        setOrders(transformedOrders);
      } else {
        // Use mock data for now
        setOrders([
          {
            id: 1,
            orderNumber: 'ORD-001',
            customer: {
              company: 'Tech Solutions Inc',
              contact: 'John Smith',
              email: 'john@techsolutions.com'
            },
            items: [
              { model: 'iPhone 13 Pro', grade: 'A+', capacity: '256GB', quantity: 2, unitPrice: 850 }
            ],
            subtotal: 1700,
            fees: [{ label: 'Shipping', amount: 25 }],
            total: 1725,
            status: 'pending',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            orderNumber: 'ORD-002',
            customer: {
              company: 'Mobile World',
              contact: 'Sarah Johnson',
              email: 'sarah@mobileworld.com'
            },
            items: [
              { model: 'iPhone 12', grade: 'B+', capacity: '128GB', quantity: 1, unitPrice: 650 }
            ],
            subtotal: 650,
            fees: [],
            total: 650,
            status: 'approved',
            createdAt: '2024-01-14T14:20:00Z',
            updatedAt: '2024-01-15T09:15:00Z'
          },
          {
            id: 3,
            orderNumber: 'ORD-003',
            customer: {
              company: 'Tech Solutions Inc',
              contact: 'John Smith',
              email: 'john@techsolutions.com'
            },
            items: [
              { model: 'iPhone 14 Pro', grade: 'A+', capacity: '512GB', quantity: 1, unitPrice: 1200 }
            ],
            subtotal: 1200,
            fees: [{ label: 'Express Shipping', amount: 50 }],
            total: 1250,
            status: 'paid',
            createdAt: '2024-01-13T16:45:00Z',
            updatedAt: '2024-01-14T11:30:00Z'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setNotification({ message: 'Failed to load orders', type: 'error' });
      // Use mock data as fallback
      setOrders([
        {
          id: 1,
          orderNumber: 'ORD-001',
          customer: {
            company: 'Tech Solutions Inc',
            contact: 'John Smith',
            email: 'john@techsolutions.com'
          },
          items: [
            { model: 'iPhone 13 Pro', grade: 'A+', capacity: '256GB', quantity: 2, unitPrice: 850 }
          ],
          subtotal: 1700,
          fees: [{ label: 'Shipping', amount: 25 }],
          total: 1725,
          status: 'pending',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        }
      ]);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
        ));
        
        // Send notifications based on status change
        sendStatusNotification(orderId, newStatus);
        
        setNotification({ message: 'Order status updated successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setNotification({ message: 'Failed to update order status', type: 'error' });
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder({ ...order });
    setShowOrderEditor(true);
  };

  const handleSaveOrder = async () => {
    try {
      // In a real implementation, this would update the order in the database
      setOrders(prev => prev.map(order => 
        order.id === editingOrder.id ? editingOrder : order
      ));
      
      setShowOrderEditor(false);
      setEditingOrder(null);
      setNotification({ message: 'Order updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating order:', error);
      setNotification({ message: 'Failed to update order', type: 'error' });
    }
  };

  const handleDeleteOrder = (order) => {
    setOrderToDelete(order);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteOrder = async () => {
    try {
      // In a real implementation, this would delete the order from the database
      setOrders(prev => prev.filter(order => order.id !== orderToDelete.id));
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
      setNotification({ message: 'Order deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting order:', error);
      setNotification({ message: 'Failed to delete order', type: 'error' });
    }
  };

  const handleDownloadInvoice = async (order) => {
    try {
      if (order.invoiceUrl) {
        // If invoice URL exists, download directly
        window.open(order.invoiceUrl, '_blank');
      } else {
        // Generate invoice on demand
        const response = await fetch('/api/invoices/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            invoiceNumber: `INV-${order.orderNumber}`,
            customer: order.customer,
            items: order.items,
            fees: order.fees || [],
            total: order.total,
            status: order.status,
            dueDate: order.paymentDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate PDF');
        }

        const pdfBlob = await response.blob();
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${order.orderNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      setNotification({ message: 'Invoice downloaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setNotification({ message: 'Failed to download invoice', type: 'error' });
    }
  };

  const sendStatusNotification = (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let message = '';
    let notificationType = 'info';
    
    switch (newStatus) {
      case 'approved':
        message = `Order ${order.orderNumber} has been approved. Inventory confirmed - please remit payment.`;
        notificationType = 'success';
        break;
      case 'paid':
        message = `Order ${order.orderNumber} payment received. Funds cleared - submit order to Assurant.`;
        notificationType = 'success';
        break;
      case 'fulfilled':
        message = `Order ${order.orderNumber} has been fulfilled. Order shipped / ready for pickup.`;
        notificationType = 'success';
        break;
      case 'cancelled':
        message = `Order ${order.orderNumber} has been cancelled.`;
        notificationType = 'warning';
        break;
      default:
        return;
    }

    // In a real implementation, this would send emails/notifications
    console.log('Notification:', message);
    
    // Show notification to user
    setNotification({ message, type: notificationType });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

    const getFilteredOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer?.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer?.contact || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    if (filterFinancing !== 'all') {
      if (filterFinancing === 'financed') {
        filtered = filtered.filter(order => order.isFinanced);
      } else if (filterFinancing === 'not-financed') {
        filtered = filtered.filter(order => !order.isFinanced);
      }
    }

    return filtered;
  };

  const getOrdersByStatus = (status) => {
    return getFilteredOrders().filter(order => order.status === status);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const statusConfig = statuses.find(s => s.key === status);
    const Icon = statusConfig?.icon || Clock;
    return <Icon className={`w-4 h-4 ${statusConfig?.color || 'text-zinc-400'}`} />;
  };

  return (
    <div className="flex-grow bg-black overflow-y-auto">
      {/* Header */}
      <div className="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-zinc-800 bg-black sticky top-0 z-30">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center text-3xl text-white">
            <Package className="w-8 h-8 mr-3 text-blue-400" />
            <h1 className="text-2xl font-bold">Orders</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status.key} value={status.key}>{status.label}</option>
              ))}
            </select>
            <select
              value={filterFinancing}
              onChange={(e) => setFilterFinancing(e.target.value)}
              className="px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Orders</option>
              <option value="financed">Financed Only</option>
              <option value="not-financed">Not Financed</option>
            </select>
            <div className="flex items-center space-x-2 bg-zinc-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sm:p-7 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {statuses.map(status => {
              const statusOrders = getOrdersByStatus(status.key);
              const Icon = status.icon;
              
              return (
                <div key={status.key} className="space-y-4">
                  {/* Column Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${status.color}`} />
                      <h3 className="text-lg font-semibold text-white">{status.label}</h3>
                      <span className="px-2 py-1 text-xs bg-zinc-800/50 text-zinc-400 rounded-full">
                        {statusOrders.length}
                      </span>
                    </div>
                  </div>

                  {/* Orders */}
                  <div className="space-y-3">
                    {statusOrders.map(order => (
                      <div
                        key={order.id}
                        className={`premium-card p-4 cursor-pointer hover:scale-105 transition-all duration-200 ${status.bgColor} ${status.borderColor}`}
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white">{order.orderNumber}</h4>
                            <p className="text-sm text-zinc-400">{order.customer?.company || 'Unknown Company'}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-400">${order.total}</div>
                            <div className="text-xs text-zinc-500">{formatDate(order.createdAt)}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm text-zinc-300">
                            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <User className="w-3 h-3 text-zinc-400" />
                              <span className="text-xs text-zinc-400">{order.customer?.contact || 'Unknown Contact'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(order.status)}
                              {order.isFinanced && (
                                <div className="w-2 h-2 bg-purple-400 rounded-full" title="Financed Order"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="premium-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-700">
                      <th className="text-left p-4 text-zinc-400 font-medium">Order #</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Customer</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Items</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Total</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Status</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Date</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredOrders().map(order => (
                      <tr key={order.id} className="border-b border-zinc-800 hover:bg-zinc-900/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-white">{order.orderNumber}</div>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="text-white">{order.customer?.company || 'Unknown Company'}</div>
                            <div className="text-sm text-zinc-400">{order.customer?.contact || 'Unknown Contact'}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-zinc-300">
                            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-lg font-bold text-blue-400">${order.total}</div>
                          {order.isFinanced && (
                            <div className="text-xs text-purple-400 mt-1">Financed</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                            statuses.find(s => s.key === order.status)?.bgColor
                          } ${
                            statuses.find(s => s.key === order.status)?.borderColor
                          }`}>
                            {getStatusIcon(order.status)}
                            <span className={statuses.find(s => s.key === order.status)?.color}>
                              {statuses.find(s => s.key === order.status)?.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-zinc-400">{formatDate(order.createdAt)}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadInvoice(order);
                              }}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all duration-200"
                              title="Download Invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setShowOrderDetails(true);
                              }}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditOrder(order);
                              }}
                              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200"
                              title="Edit Order"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOrder(order);
                              }}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="premium-card p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Order Details</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                  title="Download Invoice"
                >
                  <Download className="w-4 h-4" />
                  <span>Invoice</span>
                </button>
                <button
                  onClick={() => handleEditOrder(selectedOrder)}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                  title="Edit Order"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedOrder.orderNumber}</h3>
                  <p className="text-zinc-400">Created {formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">${selectedOrder.total}</div>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    statuses.find(s => s.key === selectedOrder.status)?.bgColor
                  } ${
                    statuses.find(s => s.key === selectedOrder.status)?.borderColor
                  }`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className={statuses.find(s => s.key === selectedOrder.status)?.color}>
                      {statuses.find(s => s.key === selectedOrder.status)?.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="premium-card p-4">
                <h4 className="font-semibold text-white mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Company:</span>
                    <span className="text-white">{selectedOrder.customer?.company || 'Unknown Company'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Contact:</span>
                    <span className="text-white">{selectedOrder.customer?.contact || 'Unknown Contact'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Email:</span>
                    <span className="text-white">{selectedOrder.customer?.email || 'No email provided'}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="premium-card p-4">
                <h4 className="font-semibold text-white mb-3">Payment Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Payment Due Date:</span>
                    <span className="text-white">
                      {selectedOrder.paymentDueDate ? formatDate(selectedOrder.paymentDueDate) : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Reminders Enabled:</span>
                    <span className={`${selectedOrder.remindersEnabled ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedOrder.remindersEnabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="premium-card p-4">
                <h4 className="font-semibold text-white mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{item.model}</div>
                        <div className="text-sm text-zinc-400">
                          {item.grade} • {item.capacity} • Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">${item.unitPrice}</div>
                        <div className="text-sm text-zinc-400">${(item.unitPrice * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-zinc-400 text-center py-4">No items found</div>
                  )}
                </div>
              </div>

              {/* Fees */}
              {selectedOrder.fees && selectedOrder.fees.length > 0 && (
                <div className="premium-card p-4">
                  <h4 className="font-semibold text-white mb-3">Additional Fees</h4>
                  <div className="space-y-2">
                    {selectedOrder.fees.map((fee, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-zinc-400">{fee.label}:</span>
                        <span className="text-white">${fee.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="premium-card p-4">
                <h4 className="font-semibold text-white mb-3">Update Status</h4>
                <div className="grid grid-cols-2 gap-3">
                  {statuses.map(status => (
                    <button
                      key={status.key}
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, status.key);
                        setShowOrderDetails(false);
                      }}
                      disabled={selectedOrder.status === status.key}
                      className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        selectedOrder.status === status.key
                          ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                          : `${status.bgColor} ${status.borderColor} hover:scale-105`
                      }`}
                    >
                      <status.icon className={`w-4 h-4 ${status.color}`} />
                      <span className={status.color}>{status.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && orderToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="premium-card p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Delete Order</h3>
              <p className="text-zinc-400 mb-6">
                Are you sure you want to delete order <strong>{orderToDelete.orderNumber}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteOrder}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Editor Modal */}
      {showOrderEditor && editingOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="premium-card p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Edit Order</h2>
              <button
                onClick={() => setShowOrderEditor(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Items */}
              <div className="premium-card p-4">
                <h4 className="font-semibold text-white mb-3">Order Items</h4>
                <div className="space-y-3">
                  {editingOrder.items?.map((item, index) => (
                    <div key={index} className="p-3 bg-zinc-900/30 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-zinc-400">Model</label>
                          <input
                            type="text"
                            value={item.model}
                            onChange={(e) => {
                              const newItems = [...editingOrder.items];
                              newItems[index].model = e.target.value;
                              setEditingOrder({ ...editingOrder, items: newItems });
                            }}
                            className="w-full mt-1 px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-zinc-400">Grade</label>
                          <input
                            type="text"
                            value={item.grade}
                            onChange={(e) => {
                              const newItems = [...editingOrder.items];
                              newItems[index].grade = e.target.value;
                              setEditingOrder({ ...editingOrder, items: newItems });
                            }}
                            className="w-full mt-1 px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-zinc-400">Capacity</label>
                          <input
                            type="text"
                            value={item.capacity}
                            onChange={(e) => {
                              const newItems = [...editingOrder.items];
                              newItems[index].capacity = e.target.value;
                              setEditingOrder({ ...editingOrder, items: newItems });
                            }}
                            className="w-full mt-1 px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-zinc-400">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...editingOrder.items];
                              newItems[index].quantity = parseInt(e.target.value);
                              setEditingOrder({ ...editingOrder, items: newItems });
                            }}
                            className="w-full mt-1 px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-zinc-400">Unit Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const newItems = [...editingOrder.items];
                              newItems[index].unitPrice = parseFloat(e.target.value);
                              setEditingOrder({ ...editingOrder, items: newItems });
                            }}
                            className="w-full mt-1 px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Settings */}
              <div className="premium-card p-4">
                <h4 className="font-semibold text-white mb-3">Payment Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400">Payment Due Date</label>
                    <input
                      type="date"
                      value={editingOrder.paymentDueDate ? new Date(editingOrder.paymentDueDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, paymentDueDate: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="remindersEnabled"
                      checked={editingOrder.remindersEnabled}
                      onChange={(e) => setEditingOrder({ ...editingOrder, remindersEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-zinc-800/50 border-zinc-700/50 rounded focus:ring-blue-500/50"
                    />
                    <label htmlFor="remindersEnabled" className="text-sm text-zinc-400">
                      Enable payment reminders
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowOrderEditor(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOrder}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.message && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders; 