import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Star,
  Clock,
  DollarSign,
  CreditCard,
  Package,
  History,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const CustomerManager = ({ onCustomerSelect, selectedCustomer }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('company');
  const [sortOrder, setSortOrder] = useState('asc');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const customerCategories = [
    { key: 'vip', label: 'VIP', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    { key: 'wholesale', label: 'Wholesale', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    { key: 'retail', label: 'Retail', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    { key: 'new', label: 'New', color: 'text-orange-400', bgColor: 'bg-orange-500/20' }
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      if (response.data.success) {
        // Transform user data to customer format with additional fields
        const customerData = response.data.data.map(user => ({
          id: user.id,
          company: user.company || 'Unknown Company',
          contact: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Contact',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          category: user.category || 'retail',
          creditLimit: user.creditLimit || 0,
          paymentTerms: user.paymentTerms || 'Net 30',
          taxExempt: user.taxExempt || false,
          notes: user.notes || '',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // Mock contact history for demonstration
          contactHistory: [
            { date: '2024-01-15', type: 'order', description: 'Placed order INV-001', amount: 1500 },
            { date: '2024-01-10', type: 'payment', description: 'Payment received', amount: 1500 },
            { date: '2024-01-05', type: 'inquiry', description: 'Product inquiry', amount: 0 }
          ]
        }));
        setCustomers(customerData);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Use mock data for demonstration
      setCustomers([
        {
          id: 1,
          company: 'Tech Solutions Inc',
          contact: 'John Smith',
          email: 'john@techsolutions.com',
          phone: '+1-555-0123',
          address: '123 Business Ave, Miami FL 33101',
          category: 'vip',
          creditLimit: 50000,
          paymentTerms: 'Net 30',
          taxExempt: false,
          notes: 'Preferred customer, high volume orders',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
          contactHistory: [
            { date: '2024-01-15', type: 'order', description: 'Placed order INV-001', amount: 1500 },
            { date: '2024-01-10', type: 'payment', description: 'Payment received', amount: 1500 },
            { date: '2024-01-05', type: 'inquiry', description: 'Product inquiry', amount: 0 }
          ]
        },
        {
          id: 2,
          company: 'Mobile World',
          contact: 'Sarah Johnson',
          email: 'sarah@mobileworld.com',
          phone: '+1-555-0456',
          address: '456 Commerce St, Miami FL 33102',
          category: 'wholesale',
          creditLimit: 25000,
          paymentTerms: 'Net 60',
          taxExempt: true,
          notes: 'Wholesale customer, tax exempt',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-10T00:00:00Z',
          contactHistory: [
            { date: '2024-01-10', type: 'order', description: 'Placed order INV-002', amount: 2500 },
            { date: '2024-01-05', type: 'payment', description: 'Payment received', amount: 2500 }
          ]
        }
      ]);
    }
    setLoading(false);
  };

  const handleAddCustomer = async (customerData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, customerData);
      if (response.data.success) {
        setCustomers(prev => [...prev, response.data.data]);
        setShowAddCustomer(false);
        setNotification({ message: 'Customer added successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      setNotification({ message: 'Failed to add customer', type: 'error' });
    }
  };

  const handleUpdateCustomer = async (customerData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${customerData.id}`, customerData);
      if (response.data.success) {
        setCustomers(prev => prev.map(c => c.id === customerData.id ? customerData : c));
        setEditingCustomer(null);
        setNotification({ message: 'Customer updated successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      setNotification({ message: 'Failed to update customer', type: 'error' });
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/${customerId}`);
      if (response.data.success) {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        setNotification({ message: 'Customer deleted successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      setNotification({ message: 'Failed to delete customer', type: 'error' });
    }
  };

  const getFilteredCustomers = () => {
    let filtered = customers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(customer => customer.category === filterCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  };

  const getCategoryInfo = (category) => {
    return customerCategories.find(cat => cat.key === category) || customerCategories[0];
  };

  const getContactHistoryTotal = (history) => {
    return history.reduce((sum, contact) => sum + contact.amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Customer Management</h2>
          <p className="text-zinc-400">Manage customer profiles, contact history, and credit terms</p>
        </div>
        <button
          onClick={() => setShowAddCustomer(true)}
          className="btn-premium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium pl-10 w-full"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-premium w-full"
          >
            <option value="all">All Categories</option>
            {customerCategories.map(category => (
              <option key={category.key} value={category.key}>{category.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-premium w-full"
          >
            <option value="company">Company</option>
            <option value="contact">Contact</option>
            <option value="category">Category</option>
            <option value="createdAt">Date Added</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Order</label>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="input-premium w-full flex items-center justify-between"
          >
            <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
            {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {getFilteredCustomers().map(customer => (
          <div key={customer.id} className="premium-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{customer.company}</h3>
                    <p className="text-zinc-400">{customer.contact}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryInfo(customer.category).bgColor} ${getCategoryInfo(customer.category).color}`}>
                    {getCategoryInfo(customer.category).label}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-300">{customer.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-300">{customer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-300">{customer.address}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Credit Limit:</span>
                      <span className="text-white">${customer.creditLimit?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Payment Terms:</span>
                      <span className="text-white">{customer.paymentTerms}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Tax Exempt:</span>
                      <span className={`${customer.taxExempt ? 'text-green-400' : 'text-red-400'}`}>
                        {customer.taxExempt ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact History */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">Recent Activity</h4>
                  <div className="space-y-2">
                    {customer.contactHistory?.slice(0, 3).map((contact, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-2 bg-zinc-800/30 rounded">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span className="text-zinc-300">{contact.description}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-zinc-400">{new Date(contact.date).toLocaleDateString()}</span>
                          {contact.amount > 0 && (
                            <span className="text-green-400">${contact.amount}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {customer.notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-zinc-300 mb-2">Notes</h4>
                    <p className="text-sm text-zinc-400 bg-zinc-800/30 p-3 rounded">{customer.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onCustomerSelect(customer)}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-blue-500 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                  }`}
                  title="Select Customer"
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingCustomer(customer)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                  title="Edit Customer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCustomer(customer.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete Customer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <CustomerForm
          customer={null}
          onSave={handleAddCustomer}
          onCancel={() => setShowAddCustomer(false)}
          title="Add New Customer"
        />
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleUpdateCustomer}
          onCancel={() => setEditingCustomer(null)}
          title="Edit Customer"
        />
      )}
    </div>
  );
};

// Customer Form Component
const CustomerForm = ({ customer, onSave, onCancel, title }) => {
  const [formData, setFormData] = useState({
    company: customer?.company || '',
    firstName: customer?.contact?.split(' ')[0] || '',
    lastName: customer?.contact?.split(' ').slice(1).join(' ') || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    category: customer?.category || 'retail',
    creditLimit: customer?.creditLimit || 0,
    paymentTerms: customer?.paymentTerms || 'Net 30',
    taxExempt: customer?.taxExempt || false,
    notes: customer?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const customerData = {
      ...formData,
      contact: `${formData.firstName} ${formData.lastName}`.trim(),
      ...(customer?.id && { id: customer.id })
    };
    onSave(customerData);
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
              <label className="block text-sm font-medium text-zinc-300 mb-2">Company Name</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="input-premium w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-premium w-full"
              >
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="vip">VIP</option>
                <option value="new">New</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input-premium w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input-premium w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-premium w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-premium w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="input-premium w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Credit Limit</label>
              <input
                type="number"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                className="input-premium w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Payment Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="input-premium w-full"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.taxExempt}
                  onChange={(e) => setFormData({ ...formData, taxExempt: e.target.checked })}
                  className="rounded border-zinc-600 bg-zinc-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-zinc-300">Tax Exempt</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="input-premium w-full"
                placeholder="Additional notes about this customer..."
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
              <span>Save Customer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerManager; 