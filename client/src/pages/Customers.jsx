import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  User,
  X,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [newCustomer, setNewCustomer] = useState({
    company: '',
    contact: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/customers`);
      if (response.data.success) {
        setCustomers(response.data.data);
      } else {
        // Use mock data for now
        setCustomers([
          {
            id: 1,
            company: 'Tech Solutions Inc',
            contact: 'John Smith',
            email: 'john@techsolutions.com',
            phone: '+1-555-0123',
            address: '123 Business Ave, Miami FL 33101'
          },
          {
            id: 2,
            company: 'Mobile World',
            contact: 'Sarah Johnson',
            email: 'sarah@mobileworld.com',
            phone: '+1-555-0456',
            address: '456 Commerce St, Miami FL 33102'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setNotification({ message: 'Failed to load customers', type: 'error' });
      // Use mock data as fallback
      setCustomers([
        {
          id: 1,
          company: 'Tech Solutions Inc',
          contact: 'John Smith',
          email: 'john@techsolutions.com',
          phone: '+1-555-0123',
          address: '123 Business Ave, Miami FL 33101'
        }
      ]);
    }
    setLoading(false);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.company || !newCustomer.contact || !newCustomer.email) {
      setNotification({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    try {
      // In a real implementation, this would create the customer in the database
      const customerData = {
        id: Date.now(),
        ...newCustomer
      };
      
      setCustomers(prev => [...prev, customerData]);
      setShowCreateCustomer(false);
      setNewCustomer({ company: '', contact: '', email: '', phone: '', address: '' });
      setNotification({ message: 'Customer created successfully', type: 'success' });
    } catch (error) {
      console.error('Error creating customer:', error);
      setNotification({ message: 'Failed to create customer', type: 'error' });
    }
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowEditCustomer(true);
  };

  const handleSaveCustomer = async () => {
    try {
      setCustomers(prev => prev.map(customer => 
        customer.id === selectedCustomer.id ? selectedCustomer : customer
      ));
      
      setShowEditCustomer(false);
      setSelectedCustomer(null);
      setNotification({ message: 'Customer updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating customer:', error);
      setNotification({ message: 'Failed to update customer', type: 'error' });
    }
  };

  const handleDeleteCustomer = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCustomer = async () => {
    try {
      setCustomers(prev => prev.filter(customer => customer.id !== customerToDelete.id));
      setShowDeleteConfirm(false);
      setCustomerToDelete(null);
      setNotification({ message: 'Customer deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting customer:', error);
      setNotification({ message: 'Failed to delete customer', type: 'error' });
    }
  };

  const getFilteredCustomers = () => {
    return customers.filter(customer =>
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="flex-grow bg-black overflow-y-auto">
      {/* Header */}
      <div className="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-zinc-800 bg-black sticky top-0 z-30">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center text-3xl text-white">
            <Users className="w-8 h-8 mr-3 text-blue-400" />
            <h1 className="text-2xl font-bold">Customers</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowCreateCustomer(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>New Customer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sm:p-7 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredCustomers().map(customer => (
              <div key={customer.id} className="premium-card p-6 hover:scale-105 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{customer.company}</h3>
                      <p className="text-sm text-zinc-400">{customer.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200"
                      title="Edit Customer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-300">{customer.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-300">{customer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-300">{customer.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Customer Modal */}
      {showCreateCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="premium-card p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Create New Customer</h2>
              <button
                onClick={() => setShowCreateCustomer(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Company Name *</label>
                <input
                  type="text"
                  value={newCustomer.company}
                  onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Contact Person *</label>
                <input
                  type="text"
                  value={newCustomer.contact}
                  onChange={(e) => setNewCustomer({ ...newCustomer, contact: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Address</label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  rows="3"
                  placeholder="Enter full address"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateCustomer(false)}
                className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Create Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditCustomer && selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="premium-card p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Edit Customer</h2>
              <button
                onClick={() => setShowEditCustomer(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Company Name *</label>
                <input
                  type="text"
                  value={selectedCustomer.company}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, company: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Contact Person *</label>
                <input
                  type="text"
                  value={selectedCustomer.contact}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, contact: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={selectedCustomer.email}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={selectedCustomer.phone}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Address</label>
                <textarea
                  value={selectedCustomer.address}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800/50 text-white rounded-lg border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditCustomer(false)}
                className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && customerToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="premium-card p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Delete Customer</h3>
              <p className="text-zinc-400 mb-6">
                Are you sure you want to delete <strong>{customerToDelete.company}</strong>? 
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
                  onClick={confirmDeleteCustomer}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  Delete Customer
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

export default Customers; 