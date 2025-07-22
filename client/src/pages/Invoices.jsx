import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Edit3, 
  Save, 
  X, 
  Search, 
  Plus, 
  Eye, 
  Trash2, 
  Calendar,
  User,
  Mail,
  AlertCircle,
  CheckCircle,
  DollarSign,
  CreditCard
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceEditor, setShowInvoiceEditor] = useState(false);
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFinancing, setFilterFinancing] = useState('all');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [editingInvoice, setEditingInvoice] = useState(null);

  const statuses = [
    { key: 'draft', label: 'Draft', icon: FileText, color: 'text-zinc-400', bgColor: 'bg-zinc-500/20', borderColor: 'border-zinc-500/30' },
    { key: 'sent', label: 'Sent', icon: Mail, color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
    { key: 'paid', label: 'Paid', icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30' },
    { key: 'overdue', label: 'Overdue', icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30' }
  ];

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`);
      if (response.data.success) {
        // Convert orders to invoices with proper data transformation
        const invoiceData = response.data.data.map(order => ({
          id: order.id,
          invoiceNumber: `INV-${order.orderNumber}`,
          orderNumber: order.orderNumber,
          customer: {
            company: order.user?.company || 'Unknown Company',
            contact: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Unknown Contact',
            email: order.user?.email || 'No email provided',
            phone: order.user?.phone || 'No phone provided',
            address: order.user?.address || 'Address to be provided'
          },
          items: order.items?.map(item => ({
            model: item.productName || 'Unknown Product',
            grade: item.grade || 'Unknown',
            capacity: item.condition || 'Unknown',
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice) || 0
          })) || [],
          subtotal: parseFloat(order.totalAmount) || 0,
          fees: [], // Backend doesn't have fees yet
          total: parseFloat(order.totalAmount) || 0,
          status: order.status === 'paid' ? 'paid' : order.status === 'pending' ? 'sent' : 'draft',
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          dueDate: new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 30)
        }));
        setInvoices(invoiceData);
      } else {
        // Use mock data for now
        setInvoices([
          {
            id: 1,
            invoiceNumber: 'INV-001',
            orderNumber: 'ORD-001',
            customer: {
              company: 'Tech Solutions Inc',
              contact: 'John Smith',
              email: 'john@techsolutions.com',
              phone: '+1 (555) 123-4567',
              address: '123 Business St, Miami FL 33101'
            },
            items: [
              { model: 'iPhone 13 Pro', grade: 'A+', capacity: '256GB', quantity: 2, unitPrice: 850 }
            ],
            subtotal: 1700,
            fees: [{ label: 'Shipping', amount: 25 }],
            total: 1725,
            status: 'sent',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
            dueDate: new Date('2024-01-15T10:30:00Z').setDate(new Date('2024-01-15T10:30:00Z').getDate() + 30)
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setNotification({ message: 'Failed to load invoices', type: 'error' });
      // Use mock data as fallback
      setInvoices([
        {
          id: 1,
          invoiceNumber: 'INV-001',
          orderNumber: 'ORD-001',
          customer: {
            company: 'Tech Solutions Inc',
            contact: 'John Smith',
            email: 'john@techsolutions.com',
            phone: '+1 (555) 123-4567',
            address: '123 Business St, Miami FL 33101'
          },
          items: [
            { model: 'iPhone 13 Pro', grade: 'A+', capacity: '256GB', quantity: 2, unitPrice: 850 }
          ],
          subtotal: 1700,
          fees: [{ label: 'Shipping', amount: 25 }],
          total: 1725,
          status: 'sent',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          dueDate: new Date('2024-01-15T10:30:00Z').setDate(new Date('2024-01-15T10:30:00Z').getDate() + 30)
        }
      ]);
    }
    setLoading(false);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice({ ...invoice });
    setShowInvoiceEditor(true);
  };

  const handleSaveInvoice = async () => {
    try {
      // Calculate subtotal from items
      const subtotal = (editingInvoice.items || []).reduce((sum, item) => {
        return sum + (parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0));
      }, 0);

      // Calculate fees total
      const feesTotal = (editingInvoice.fees || []).reduce((sum, fee) => {
        if (fee.type === 'percentage') {
          // Calculate percentage of subtotal
          return sum + (subtotal * (parseFloat(fee.amount || 0) / 100));
        } else {
          // Fixed amount
          return sum + parseFloat(fee.amount || 0);
        }
      }, 0);

      // Calculate total amount
      const total = subtotal + feesTotal;

      // Update invoice with calculated totals
      const updatedInvoice = {
        ...editingInvoice,
        subtotal: subtotal,
        feesTotal: feesTotal,
        total: total
      };

      // In a real implementation, this would update the invoice in the database
      setInvoices(prev => prev.map(inv => 
        inv.id === editingInvoice.id ? updatedInvoice : inv
      ));
      
      setShowInvoiceEditor(false);
      setEditingInvoice(null);
      setNotification({ message: 'Invoice updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating invoice:', error);
      setNotification({ message: 'Failed to update invoice', type: 'error' });
    }
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      // Call the backend API to generate PDF
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(invoice)
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF blob
      const pdfBlob = await response.blob();
      
      // Create download link
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
      console.error('Error downloading invoice:', error);
      setNotification({ message: 'Failed to download invoice', type: 'error' });
    }
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceViewer(true);
  };

  const handleDeleteInvoice = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteInvoice = async () => {
    try {
      // In a real implementation, this would delete the invoice from the database
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete.id));
      setShowDeleteConfirm(false);
      setInvoiceToDelete(null);
      setNotification({ message: 'Invoice deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setNotification({ message: 'Failed to delete invoice', type: 'error' });
    }
  };

  const generateInvoiceHTML = (invoice) => {
    const today = new Date().toLocaleDateString();
    const dueDate = new Date(invoice.dueDate).toLocaleDateString();
    
    const itemsHTML = (invoice.items || []).map(item => 
      `<tr>
        <td>${item.model}</td>
        <td>${item.grade}</td>
        <td>${item.capacity}</td>
        <td>${item.quantity}</td>
        <td>$${item.unitPrice}</td>
        <td>$${(item.unitPrice * item.quantity).toFixed(2)}</td>
      </tr>`
    ).join('') || '<tr><td colspan="6">No items found</td></tr>';
    
    const feesHTML = (invoice.fees || []).map(fee => 
      `<div class="total-row">
        <span>${fee.label}:</span>
        <span>$${fee.amount}</span>
      </div>`
    ).join('');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #ffffff; 
            color: #000000;
            line-height: 1.6;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
          }
          .company-info h1 {
            color: #1f2937;
            font-size: 28px;
            font-weight: bold;
            margin: 0 0 10px 0;
          }
          .company-info p {
            color: #6b7280;
            margin: 5px 0;
            font-size: 14px;
          }
          .invoice-details {
            text-align: right;
          }
          .invoice-details h2 {
            color: #1f2937;
            font-size: 24px;
            margin: 0 0 10px 0;
          }
          .invoice-details p {
            color: #6b7280;
            margin: 5px 0;
            font-size: 14px;
          }
          .customer-info {
            margin-bottom: 30px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 6px;
          }
          .customer-info h3 {
            color: #1f2937;
            font-size: 18px;
            margin: 0 0 15px 0;
          }
          .customer-info p {
            color: #374151;
            margin: 5px 0;
            font-size: 14px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th {
            background: #f3f4f6;
            color: #1f2937;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
          }
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            color: #374151;
          }
          .items-table tr:nth-child(even) {
            background: #f9fafb;
          }
          .totals {
            margin-top: 30px;
            text-align: right;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 16px;
          }
          .total-row.grand-total {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            border-top: 2px solid #e5e7eb;
            padding-top: 15px;
            margin-top: 15px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; padding: 0; }
            .invoice-container { box-shadow: none; border-radius: 0; }
            .header { background: #ffffff !important; color: #000000 !important; }
            .header h1 { background: none !important; -webkit-background-clip: unset !important; -webkit-text-fill-color: unset !important; color: #000000 !important; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-info">
              <h1>Albi Logistics</h1>
              <p>Professional Mobile Device Solutions</p>
              <p>Miami, FL 33101</p>
              <p>Phone: +1-555-0123</p>
              <p>Email: info@albilogistics.com</p>
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> ${today}</p>
              <p><strong>Due Date:</strong> ${dueDate}</p>
              <p><strong>Status:</strong> ${invoice.status}</p>
            </div>
          </div>
          
          <div class="customer-info">
            <h3>Bill To:</h3>
            <p><strong>${invoice.customer?.company || 'Company Name'}</strong></p>
            <p>${invoice.customer?.contact || 'Contact Person'}</p>
            <p>${invoice.customer?.email || 'email@company.com'}</p>
            <p>${invoice.customer?.phone || 'Phone Number'}</p>
            <p>${invoice.customer?.address || 'Address'}</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Grade</th>
                <th>Capacity</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div class="totals">
            ${feesHTML}
            <div class="total-row grand-total">
              <span>Total:</span>
              <span>$${invoice.total}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Payment is due within 30 days of invoice date.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const getFilteredInvoices = () => {
    let filtered = invoices;
    
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.customer?.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.customer?.contact || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filterStatus);
    }
    
    if (filterFinancing !== 'all') {
      if (filterFinancing === 'financed') {
        filtered = filtered.filter(invoice => invoice.isFinanced);
      } else if (filterFinancing === 'not-financed') {
        filtered = filtered.filter(invoice => !invoice.isFinanced);
      }
    }
    
    return filtered;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    const statusConfig = statuses.find(s => s.key === status);
    return statusConfig ? statusConfig.icon : FileText;
  };

  const getStatusColor = (status) => {
    const statusConfig = statuses.find(s => s.key === status);
    return statusConfig ? statusConfig.color : 'text-zinc-400';
  };

  const getStatusBgColor = (status) => {
    const statusConfig = statuses.find(s => s.key === status);
    return statusConfig ? statusConfig.bgColor : 'bg-zinc-500/20';
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
            <FileText className="w-8 h-8 mr-3 text-blue-400" />
            <h1 className="text-2xl font-bold">Invoices</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status.key} value={status.key}>{status.label}</option>
              ))}
            </select>
            <select
              value={filterFinancing}
              onChange={(e) => setFilterFinancing(e.target.value)}
              className="px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Invoices</option>
              <option value="financed">Financed Only</option>
              <option value="not-financed">Not Financed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sm:p-7 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredInvoices().map((invoice) => (
          <div key={invoice.id} className="premium-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{invoice.invoiceNumber}</h3>
                <p className="text-zinc-400 text-sm">{invoice.customer?.company || 'Unknown Company'}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(invoice.status)} ${getStatusColor(invoice.status)}`}>
                {invoice.status}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-zinc-400">
                <User className="w-4 h-4 mr-2" />
                <span>{invoice.customer?.contact || 'Unknown Contact'}</span>
              </div>
              <div className="flex items-center text-sm text-zinc-400">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(invoice.createdAt)}</span>
              </div>
              <div className="flex items-center text-sm text-zinc-400">
                <DollarSign className="w-4 h-4 mr-2" />
                <span>${(invoice.total || 0).toFixed(2)}</span>
              </div>
              {invoice.isFinanced && (
                <div className="flex items-center text-sm text-purple-400">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span>Financed</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditInvoice(invoice)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                  title="Edit Invoice"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewDetails(invoice)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownloadPDF(invoice)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => handleDeleteInvoice(invoice)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Delete Invoice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Invoice Editor Modal */}
      {showInvoiceEditor && editingInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="premium-card p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Edit Invoice</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSaveInvoice()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={() => setShowInvoiceEditor(false)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Invoice Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-zinc-800/30 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Invoice Number</label>
                  <input
                    type="text"
                    value={editingInvoice.invoiceNumber || ''}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      invoiceNumber: e.target.value
                    })}
                    className="input-premium w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Invoice Date</label>
                  <input
                    type="date"
                    value={editingInvoice.createdAt ? new Date(editingInvoice.createdAt).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      createdAt: new Date(e.target.value).toISOString()
                    })}
                    className="input-premium w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={editingInvoice.dueDate ? new Date(editingInvoice.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      dueDate: new Date(e.target.value).toISOString()
                    })}
                    className="input-premium w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Payment Terms</label>
                  <select
                    value={editingInvoice.paymentTerms || 'Net 30'}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      paymentTerms: e.target.value,
                      customPaymentTerms: e.target.value === 'Other' ? editingInvoice.customPaymentTerms : ''
                    })}
                    className="input-premium w-full"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Zelle">Zelle</option>
                    <option value="Wire Transfer">Wire Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {editingInvoice.paymentTerms === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Custom Payment Terms</label>
                    <input
                      type="text"
                      value={editingInvoice.customPaymentTerms || ''}
                      onChange={(e) => setEditingInvoice({
                        ...editingInvoice,
                        customPaymentTerms: e.target.value
                      })}
                      placeholder="Specify custom payment terms..."
                      className="input-premium w-full"
                    />
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-800/30 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={editingInvoice.customer?.company || ''}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      customer: { ...editingInvoice.customer, company: e.target.value }
                    })}
                    className="input-premium w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={editingInvoice.customer?.contact || ''}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      customer: { ...editingInvoice.customer, contact: e.target.value }
                    })}
                    className="input-premium w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingInvoice.customer?.email || ''}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      customer: { ...editingInvoice.customer, email: e.target.value }
                    })}
                    className="input-premium w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editingInvoice.customer?.phone || ''}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      customer: { ...editingInvoice.customer, phone: e.target.value }
                    })}
                    className="input-premium w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Billing Address</label>
                  <textarea
                    value={editingInvoice.customer?.address || ''}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      customer: { ...editingInvoice.customer, address: e.target.value }
                    })}
                    rows={3}
                    className="input-premium w-full"
                  />
                </div>
              </div>

              {/* Invoice Items with Bulk Operations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Invoice Items</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const newItems = [...(editingInvoice.items || []), {
                          id: Date.now(),
                          model: '',
                          grade: '',
                          capacity: '',
                          quantity: 1,
                          unitPrice: 0
                        }];
                        setEditingInvoice({ ...editingInvoice, items: newItems });
                      }}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Item</span>
                    </button>
                    <button
                      onClick={() => {
                        // Bulk price update by percentage
                        const percentage = prompt('Enter percentage change (e.g., 10 for +10%, -5 for -5%):');
                        if (percentage && !isNaN(percentage)) {
                          const newItems = editingInvoice.items.map(item => ({
                            ...item,
                            unitPrice: item.unitPrice * (1 + parseFloat(percentage) / 100)
                          }));
                          setEditingInvoice({ ...editingInvoice, items: newItems });
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                    >
                      Bulk Price Update
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {editingInvoice.items?.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 bg-zinc-800/30 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Model</label>
                        <input
                          type="text"
                          value={item.model}
                          onChange={(e) => {
                            const newItems = [...editingInvoice.items];
                            newItems[index] = { ...item, model: e.target.value };
                            setEditingInvoice({ ...editingInvoice, items: newItems });
                          }}
                          className="input-premium w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Grade</label>
                        <input
                          type="text"
                          value={item.grade}
                          onChange={(e) => {
                            const newItems = [...editingInvoice.items];
                            newItems[index] = { ...item, grade: e.target.value };
                            setEditingInvoice({ ...editingInvoice, items: newItems });
                          }}
                          className="input-premium w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Capacity</label>
                        <input
                          type="text"
                          value={item.capacity}
                          onChange={(e) => {
                            const newItems = [...editingInvoice.items];
                            newItems[index] = { ...item, capacity: e.target.value };
                            setEditingInvoice({ ...editingInvoice, items: newItems });
                          }}
                          className="input-premium w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...editingInvoice.items];
                            newItems[index] = { ...item, quantity: parseInt(e.target.value) || 0 };
                            setEditingInvoice({ ...editingInvoice, items: newItems });
                          }}
                          className="input-premium w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Unit Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const newItems = [...editingInvoice.items];
                            newItems[index] = { ...item, unitPrice: parseFloat(e.target.value) || 0 };
                            setEditingInvoice({ ...editingInvoice, items: newItems });
                          }}
                          className="input-premium w-full"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="w-full">
                          <label className="block text-sm font-medium text-zinc-300 mb-1">Total</label>
                          <div className="input-premium w-full bg-zinc-700/50 text-white">
                            ${((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            const newItems = editingInvoice.items.filter((_, i) => i !== index);
                            setEditingInvoice({ ...editingInvoice, items: newItems });
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Fee Management */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Fees & Charges</h3>
                  <button
                    onClick={() => {
                      const newFees = [...(editingInvoice.fees || []), {
                        id: Date.now(),
                        label: '',
                        amount: 0,
                        category: 'other',
                        type: 'fixed'
                      }];
                      setEditingInvoice({ ...editingInvoice, fees: newFees });
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Fee</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {editingInvoice.fees?.map((fee, index) => (
                    <div key={fee.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-zinc-800/30 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Category</label>
                        <select
                          value={fee.category || 'other'}
                          onChange={(e) => {
                            const newFees = [...editingInvoice.fees];
                            newFees[index] = { ...fee, category: e.target.value };
                            setEditingInvoice({ ...editingInvoice, fees: newFees });
                          }}
                          className="input-premium w-full"
                        >
                          <option value="shipping">Shipping</option>
                          <option value="tax">Tax</option>
                          <option value="handling">Handling</option>
                          <option value="rush">Rush Processing</option>
                          <option value="discount">Discount</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Type</label>
                        <select
                          value={fee.type || 'fixed'}
                          onChange={(e) => {
                            const newFees = [...editingInvoice.fees];
                            newFees[index] = { ...fee, type: e.target.value };
                            setEditingInvoice({ ...editingInvoice, fees: newFees });
                          }}
                          className="input-premium w-full"
                        >
                          <option value="fixed">Fixed Amount</option>
                          <option value="percentage">Percentage</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Label</label>
                        <input
                          type="text"
                          value={fee.label}
                          onChange={(e) => {
                            const newFees = [...editingInvoice.fees];
                            newFees[index] = { ...fee, label: e.target.value };
                            setEditingInvoice({ ...editingInvoice, fees: newFees });
                          }}
                          className="input-premium w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          value={fee.amount}
                          onChange={(e) => {
                            const newFees = [...editingInvoice.fees];
                            newFees[index] = { ...fee, amount: parseFloat(e.target.value) || 0 };
                            setEditingInvoice({ ...editingInvoice, fees: newFees });
                          }}
                          className="input-premium w-full"
                        />
                        {fee.type === 'percentage' && (
                          <div className="text-xs text-zinc-400 mt-1">
                            Calculated: ${(() => {
                              const subtotal = (editingInvoice.items || []).reduce((sum, item) => {
                                return sum + (parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0));
                              }, 0);
                              return (subtotal * (parseFloat(fee.amount || 0) / 100)).toFixed(2);
                            })()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            const newFees = editingInvoice.fees.filter((_, i) => i !== index);
                            setEditingInvoice({ ...editingInvoice, fees: newFees });
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Totals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-zinc-800/30 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Subtotal</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingInvoice.subtotal || 0}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      subtotal: parseFloat(e.target.value) || 0
                    })}
                    className="input-premium w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Fees Total</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingInvoice.feesTotal || 0}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      feesTotal: parseFloat(e.target.value) || 0
                    })}
                    className="input-premium w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Total Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingInvoice.total || 0}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      total: parseFloat(e.target.value) || 0
                    })}
                    className="input-premium w-full"
                  />
                </div>
              </div>

              {/* Notes & Comments */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Notes & Comments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Customer Notes</label>
                    <textarea
                      value={editingInvoice.customerNotes || ''}
                      onChange={(e) => setEditingInvoice({
                        ...editingInvoice,
                        customerNotes: e.target.value
                      })}
                      rows={4}
                      placeholder="Notes visible to customer..."
                      className="input-premium w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Internal Comments</label>
                    <textarea
                      value={editingInvoice.internalNotes || ''}
                      onChange={(e) => setEditingInvoice({
                        ...editingInvoice,
                        internalNotes: e.target.value
                      })}
                      rows={4}
                      placeholder="Internal comments (not visible to customer)..."
                      className="input-premium w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Viewer Modal */}
      {showInvoiceViewer && selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="premium-card p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Invoice Details</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadPDF(selectedInvoice)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setShowInvoiceViewer(false)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Invoice Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Invoice Number:</span>
                      <span className="text-white">{selectedInvoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Order Number:</span>
                      <span className="text-white">{selectedInvoice.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(selectedInvoice.status)} ${getStatusColor(selectedInvoice.status)}`}>
                        {selectedInvoice.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Created:</span>
                      <span className="text-white">{formatDate(selectedInvoice.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Due Date:</span>
                      <span className="text-white">{formatDate(selectedInvoice.dueDate)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Company:</span>
                      <span className="text-white">{selectedInvoice.customer?.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Contact:</span>
                      <span className="text-white">{selectedInvoice.customer?.contact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Email:</span>
                      <span className="text-white">{selectedInvoice.customer?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Phone:</span>
                      <span className="text-white">{selectedInvoice.customer?.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Invoice Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        <th className="text-left py-2 text-zinc-400">Item</th>
                        <th className="text-left py-2 text-zinc-400">Grade</th>
                        <th className="text-left py-2 text-zinc-400">Capacity</th>
                        <th className="text-left py-2 text-zinc-400">Quantity</th>
                        <th className="text-right py-2 text-zinc-400">Unit Price</th>
                        <th className="text-right py-2 text-zinc-400">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((item, index) => (
                        <tr key={index} className="border-b border-zinc-800">
                          <td className="py-3 text-white">{item.model}</td>
                          <td className="py-3 text-zinc-400">{item.grade}</td>
                          <td className="py-3 text-zinc-400">{item.capacity}</td>
                          <td className="py-3 text-zinc-400">{item.quantity}</td>
                          <td className="py-3 text-right text-zinc-400">${item.unitPrice?.toFixed(2)}</td>
                          <td className="py-3 text-right text-white font-medium">
                            ${((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoice Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Subtotal:</span>
                    <span className="text-white">${(selectedInvoice.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {selectedInvoice.fees?.map((fee, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-zinc-400">{fee.label}:</span>
                      <span className="text-white">${fee.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-zinc-700 pt-2">
                    <span className="text-white font-semibold">Total:</span>
                    <span className="text-white font-semibold">${(selectedInvoice.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && invoiceToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="premium-card p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Delete Invoice</h2>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-zinc-300">
                Are you sure you want to delete invoice <strong>{invoiceToDelete.invoiceNumber}</strong>?
              </p>
              <p className="text-zinc-400 text-sm mt-2">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteInvoice}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
              >
                Delete Invoice
              </button>
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

export default Invoices; 