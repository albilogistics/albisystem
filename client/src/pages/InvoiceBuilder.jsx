import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Eye,
  Edit3,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  Package,
  CreditCard
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const InvoiceBuilder = () => {
  const [invoice, setInvoice] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    customer: {
      company: '',
      contact: '',
      email: '',
      phone: '',
      address: ''
    },
    items: [],
    fees: [],
    status: 'draft',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/costs`);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleCustomerChange = (customerId) => {
    const selectedCustomer = customers.find(c => c.id === parseInt(customerId));
    if (selectedCustomer) {
      setInvoice(prev => ({
        ...prev,
        customer: {
          company: selectedCustomer.company || '',
          contact: `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim(),
          email: selectedCustomer.email || '',
          phone: selectedCustomer.phone || '',
          address: selectedCustomer.address || ''
        }
      }));
    }
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now(),
        model: '',
        grade: '',
        capacity: '',
        quantity: 1,
        unitPrice: 0
      }]
    }));
  };

  const updateItem = (index, field, value) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (index) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const addFee = () => {
    setInvoice(prev => ({
      ...prev,
      fees: [...prev.fees, {
        id: Date.now(),
        label: '',
        amount: 0
      }]
    }));
  };

  const updateFee = (index, field, value) => {
    setInvoice(prev => ({
      ...prev,
      fees: prev.fees.map((fee, i) => 
        i === index ? { ...fee, [field]: value } : fee
      )
    }));
  };

  const removeFee = (index) => {
    setInvoice(prev => ({
      ...prev,
      fees: prev.fees.filter((_, i) => i !== index)
    }));
  };

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateFeesTotal = () => {
    return invoice.fees.reduce((sum, fee) => sum + fee.amount, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateFeesTotal();
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      const invoiceData = {
        ...invoice,
        subtotal: calculateSubtotal(),
        feesTotal: calculateFeesTotal(),
        total: calculateTotal()
      };

      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(invoiceData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setNotification({ message: 'Invoice PDF downloaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setNotification({ message: 'Failed to generate PDF', type: 'error' });
    }
    setLoading(false);
  };

  const handleSaveInvoice = async () => {
    setLoading(true);
    try {
      const invoiceData = {
        ...invoice,
        subtotal: calculateSubtotal(),
        feesTotal: calculateFeesTotal(),
        total: calculateTotal()
      };

      // Save to database
      const response = await axios.post(`${API_BASE_URL}/invoices`, invoiceData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setNotification({ message: 'Invoice saved successfully!', type: 'success' });
        // Update invoice number with the saved one
        setInvoice(prev => ({
          ...prev,
          invoiceNumber: response.data.data.invoiceNumber
        }));
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      setNotification({ message: 'Failed to save invoice', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="flex-grow bg-black overflow-y-auto">
      {/* Notification */}
      {notification.message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-zinc-800/50 bg-black sticky top-0 z-30">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Invoice Builder</h1>
              <p className="text-zinc-400 text-sm">Create and edit professional invoices</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
              <span>{previewMode ? 'Edit' : 'Preview'}</span>
            </button>
            <button
              onClick={handleSaveInvoice}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Generate PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="sm:p-7 p-4">
        {previewMode ? (
          <InvoicePreview invoice={invoice} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Invoice Details */}
            <div className="space-y-6">
              <div className="premium-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Invoice Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Invoice Number</label>
                    <input
                      type="text"
                      value={invoice.invoiceNumber}
                      onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={invoice.dueDate}
                      onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Status</label>
                    <select
                      value={invoice.status}
                      onChange={(e) => setInvoice(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="premium-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Customer Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Select Customer</label>
                    <select
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select a customer...</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.company || `${customer.firstName} ${customer.lastName}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Company</label>
                    <input
                      type="text"
                      value={invoice.customer.company}
                      onChange={(e) => setInvoice(prev => ({ 
                        ...prev, 
                        customer: { ...prev.customer, company: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Contact Person</label>
                    <input
                      type="text"
                      value={invoice.customer.contact}
                      onChange={(e) => setInvoice(prev => ({ 
                        ...prev, 
                        customer: { ...prev.customer, contact: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={invoice.customer.email}
                      onChange={(e) => setInvoice(prev => ({ 
                        ...prev, 
                        customer: { ...prev.customer, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={invoice.customer.phone}
                      onChange={(e) => setInvoice(prev => ({ 
                        ...prev, 
                        customer: { ...prev.customer, phone: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Address</label>
                    <textarea
                      value={invoice.customer.address}
                      onChange={(e) => setInvoice(prev => ({ 
                        ...prev, 
                        customer: { ...prev.customer, address: e.target.value }
                      }))}
                      rows={3}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Items and Fees */}
            <div className="space-y-6">
              {/* Invoice Items */}
              <div className="premium-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Invoice Items</h3>
                  <button
                    onClick={addItem}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {invoice.items.map((item, index) => (
                    <div key={item.id} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">Model</label>
                          <input
                            type="text"
                            value={item.model}
                            onChange={(e) => updateItem(index, 'model', e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">Grade</label>
                          <input
                            type="text"
                            value={item.grade}
                            onChange={(e) => updateItem(index, 'grade', e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">Capacity</label>
                          <input
                            type="text"
                            value={item.capacity}
                            onChange={(e) => updateItem(index, 'capacity', e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">Unit Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">
                          Total: ${(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Fees */}
              <div className="premium-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Additional Fees</h3>
                  <button
                    onClick={addFee}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Fee</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {invoice.fees.map((fee, index) => (
                    <div key={fee.id} className="flex items-center space-x-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Fee label"
                          value={fee.label}
                          onChange={(e) => updateFee(index, 'label', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Amount"
                          value={fee.amount}
                          onChange={(e) => updateFee(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => removeFee(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="premium-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Invoice Totals</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Fees:</span>
                    <span>${calculateFeesTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-semibold text-white border-t border-zinc-700 pt-3">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Invoice Preview Component
const InvoicePreview = ({ invoice }) => {
  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateFeesTotal = () => {
    return invoice.fees.reduce((sum, fee) => sum + fee.amount, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateFeesTotal();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white text-black rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Albi Logistics LLC</h1>
          <p className="text-lg opacity-90">Professional Mobile Device Solutions</p>
          <p className="text-sm opacity-80">3761 SW 139 PL, Miami FL 33175</p>
          <p className="text-sm opacity-80">info@albilogistics.com | 786-991-5075</p>
        </div>

        {/* Invoice Details */}
        <div className="p-8 bg-gray-50">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">INVOICE</h2>
              <div className="space-y-2 text-gray-600">
                <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Bill To:</h3>
              <div className="space-y-1 text-gray-600">
                <p className="font-medium">{invoice.customer.company}</p>
                <p>{invoice.customer.contact}</p>
                <p>{invoice.customer.email}</p>
                <p>{invoice.customer.phone}</p>
                <p>{invoice.customer.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Item</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Grade</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Capacity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Quantity</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-800">Unit Price</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-800">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">{item.model}</td>
                  <td className="py-3 px-4 text-gray-700">{item.grade}</td>
                  <td className="py-3 px-4 text-gray-700">{item.capacity}</td>
                  <td className="py-3 px-4 text-gray-700">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-gray-700">${item.unitPrice?.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-gray-700">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-8 text-right">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              {invoice.fees.map((fee, index) => (
                <div key={index} className="flex justify-between text-gray-600">
                  <span>{fee.label}:</span>
                  <span>${fee.amount?.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-xl font-bold text-gray-800 border-t-2 border-gray-200 pt-2">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="p-8 bg-gray-50">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Instructions</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Bank:</strong> JP Morgan Chase Bank</p>
                <p><strong>Beneficiary:</strong> ALBI LOGISTICS LLC</p>
                <p><strong>Account #:</strong> 267084131</p>
                <p><strong>Routing:</strong> 021000021</p>
                <p><strong>Reference:</strong> Invoice {invoice.invoiceNumber}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Alternative Payment</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Zelle:</strong> albilogisticsllc@gmail.com</p>
                <p><strong>PayPal:</strong> pay@albilogistics.com</p>
                <p><strong>Check:</strong> Payable to Albi Logistics LLC</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-800 text-gray-300 text-center text-sm">
          <p className="font-medium">Thank you for your business!</p>
          <p>Payment is due within 30 days of invoice date.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBuilder; 