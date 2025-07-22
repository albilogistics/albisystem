import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShoppingCart, 
  User, 
  DollarSign, 
  Plus, 
  X, 
  FileText,
  Download,
  Mail,
  Phone,
  Building,
  MapPin,
  Trash2,
  Edit3,
  Save,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Calendar,
  Clock
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const Checkout = () => {
  const { 
    cart, 
    selectedCustomer, 
    setSelectedCustomer, 
    additionalFees, 
    addFee, 
    removeFee, 
    updateFee,
    getCartSubtotal,
    getCartTotal,
    getFeesTotal,
    clearCart
  } = useCart();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddFee, setShowAddFee] = useState(false);
  const [newFeeLabel, setNewFeeLabel] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState('');
  const [editingFee, setEditingFee] = useState(null);
  const [paymentDueDate, setPaymentDueDate] = useState(() => {
    const defaultDate = new Date();
    return defaultDate.toISOString().split('T')[0];
  });
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    company: '',
    contact: '',
    email: '',
    phone: '',
    address: ''
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [discountValue, setDiscountValue] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [isFinanced, setIsFinanced] = useState(false);
  const [financingDetails, setFinancingDetails] = useState({
    interestRate: 1.5,
    interestPeriod: 7,
    financedAmount: 0,
    startDate: new Date().toISOString().split('T')[0]
  });

  // Load customers from backend
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/customers`);
        if (response.data.success) {
          setCustomers(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
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
    };

    fetchCustomers();
  }, []);

  const handleAddFee = () => {
    if (newFeeLabel && newFeeAmount) {
      addFee(newFeeLabel, parseFloat(newFeeAmount));
      setNewFeeLabel('');
      setNewFeeAmount('');
      setShowAddFee(false);
    }
  };

  const handleEditFee = (feeId, label, amount) => {
    updateFee(feeId, label, amount);
    setEditingFee(null);
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
      setSelectedCustomer(customerData);
      setShowCreateCustomer(false);
      setNewCustomer({ company: '', contact: '', email: '', phone: '', address: '' });
      setNotification({ message: 'Customer created successfully', type: 'success' });
    } catch (error) {
      console.error('Error creating customer:', error);
      setNotification({ message: 'Failed to create customer', type: 'error' });
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedCustomer) {
      setNotification({ message: 'Please select a customer first', type: 'error' });
      return;
    }

    if (cart.length === 0) {
      setNotification({ message: 'Cart is empty', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const subtotal = getCartSubtotal();
      const feesTotal = getFeesTotal();
      
      // Calculate discount
      let discountAmount = 0;
      if (discountValue && parseFloat(discountValue) > 0) {
        if (discountType === 'percentage') {
          discountAmount = subtotal * (parseFloat(discountValue) / 100);
        } else {
          discountAmount = parseFloat(discountValue);
        }
      }
      
      const total = subtotal + feesTotal - discountAmount;

      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          productName: `${item.model} ${item.grade} ${item.capacity} ${item.color}`,
          quantity: item.quantity,
          unitPrice: item.finalPrice || item.customerPrice || item.sellPrice,
          grade: item.grade,
          condition: item.capacity // This will be stored as capacity in the database
        })),
        shippingAddress: selectedCustomer.address,
        billingAddress: selectedCustomer.address,
        notes: `Customer: ${selectedCustomer.company} - ${selectedCustomer.contact}`,
        paymentDueDate: new Date(paymentDueDate).toISOString(),
        remindersEnabled: true,
        isFinanced: isFinanced,
        financing: isFinanced ? {
          interestRate: financingDetails.interestRate,
          interestPeriod: financingDetails.interestPeriod,
          financedAmount: financingDetails.financedAmount || total,
          startDate: financingDetails.startDate,
          notes: `Financed order for ${selectedCustomer.company}`
        } : null
      };

      const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
      
      if (response.data.success) {
        setNotification({ message: 'Order created successfully! Redirecting to Orders...', type: 'success' });
        clearCart();
        setDiscountValue('');
        setDiscountReason('');
        // Redirect to orders page after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard/orders';
        }, 1500);
      } else {
        setNotification({ message: 'Failed to create order', type: 'error' });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setNotification({ message: 'Error creating order', type: 'error' });
    }
    setLoading(false);
  };

  const handleGenerateInvoice = async () => {
    if (!selectedCustomer) {
      setNotification({ message: 'Please select a customer first', type: 'error' });
      return;
    }

    if (cart.length === 0) {
      setNotification({ message: 'Cart is empty', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const subtotal = getCartSubtotal();
      const feesTotal = getFeesTotal();
      
      // Calculate discount
      let discountAmount = 0;
      if (discountValue && parseFloat(discountValue) > 0) {
        if (discountType === 'percentage') {
          discountAmount = subtotal * (parseFloat(discountValue) / 100);
        } else {
          discountAmount = parseFloat(discountValue);
        }
      }
      
      const total = subtotal + feesTotal - discountAmount;

      // Generate invoice without creating order
      await generateInvoicePDF({
        orderNumber: `INV-${Date.now()}`,
        customer: selectedCustomer,
        items: cart,
        fees: additionalFees,
        subtotal: subtotal,
        feesTotal: feesTotal,
        discount: {
          type: discountType,
          value: parseFloat(discountValue) || 0,
          amount: discountAmount,
          reason: discountReason
        },
        total: total,
        status: 'draft',
        dueDate: new Date(paymentDueDate),
        paymentTerms: 'Net 30', // Default payment terms
        isFinanced: isFinanced,
        financing: isFinanced ? {
          interestRate: financingDetails.interestRate,
          interestPeriod: financingDetails.interestPeriod,
          financedAmount: financingDetails.financedAmount || total,
          startDate: financingDetails.startDate,
          nextInterestDate: (() => {
            const startDate = new Date(financingDetails.startDate);
            startDate.setDate(startDate.getDate() + financingDetails.interestPeriod);
            return startDate.toISOString();
          })(),
          totalInterestPaid: 0,
          totalAmountPaid: 0,
          remainingBalance: financingDetails.financedAmount || total,
          status: 'active',
          paymentHistory: []
        } : null
      });
      
      setNotification({ message: 'Invoice generated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error generating invoice:', error);
      setNotification({ message: 'Error generating invoice', type: 'error' });
    }
    setLoading(false);
  };

  const generateInvoicePDF = async (order) => {
    try {
      // Call the backend API to generate PDF
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(order)
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
      link.download = `invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setNotification({ message: 'Invoice PDF downloaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      setNotification({ message: 'Failed to generate invoice PDF', type: 'error' });
    }
  };

  const generateInvoiceHTML = (order) => {
    const today = new Date().toLocaleDateString();
    const invoiceNumber = order.orderNumber || `INV-${Date.now()}`;
    const dueDate = order.dueDate ? new Date(order.dueDate).toLocaleDateString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceNumber}</title>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            background: #000000; 
            color: #ffffff;
            line-height: 1.6;
          }
          .invoice-container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: #111111;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #333333;
          }
          .header { 
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: white;
            padding: 40px;
            text-align: center;
            border-bottom: 1px solid #333333;
          }
          .header h1 { 
            margin: 0; 
            font-size: 2.5rem; 
            font-weight: 700;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #ffffff 0%, #cccccc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .header p { 
            margin: 8px 0 0 0; 
            font-size: 1.1rem;
            opacity: 0.8;
            color: #cccccc;
          }
          .invoice-details { 
            padding: 40px; 
            border-bottom: 1px solid #333333;
            background: #1a1a1a;
          }
          .invoice-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 40px; 
            margin-bottom: 40px;
          }
          .invoice-info h2 { 
            color: #ffffff; 
            margin: 0 0 20px 0; 
            font-size: 1.5rem;
            font-weight: 600;
          }
          .invoice-info p { 
            margin: 8px 0; 
            color: #cccccc;
            font-size: 0.95rem;
          }
          .invoice-info strong { 
            color: #ffffff;
            font-weight: 600;
          }
          .customer-info h3 { 
            color: #ffffff; 
            margin: 0 0 15px 0; 
            font-size: 1.2rem;
            font-weight: 600;
          }
          .customer-info p { 
            margin: 6px 0; 
            color: #cccccc;
            font-size: 0.95rem;
          }
          .items-section { 
            padding: 40px; 
            border-bottom: 1px solid #333333;
            background: #1a1a1a;
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
            background: #222222;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          .items-table th { 
            background: #333333; 
            padding: 16px 12px; 
            text-align: left; 
            font-weight: 600;
            color: #ffffff;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .items-table td { 
            padding: 16px 12px; 
            text-align: left; 
            border-bottom: 1px solid #444444;
            color: #cccccc;
            font-size: 0.95rem;
          }
          .items-table tr:hover { 
            background: #2a2a2a;
          }
          .totals-section { 
            padding: 40px; 
            background: #222222;
          }
          .totals-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 40px;
          }
          .totals-left { 
            text-align: left;
          }
          .totals-right { 
            text-align: right;
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0;
            font-size: 0.95rem;
            color: #cccccc;
          }
          .total-row.grand { 
            font-weight: 700; 
            font-size: 1.2rem; 
            border-top: 2px solid #444444; 
            padding-top: 16px;
            margin-top: 16px;
            color: #ffffff;
          }
          .payment-section { 
            padding: 40px; 
            background: #333333;
          }
          .payment-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 40px;
          }
          .payment-info h3 { 
            color: #ffffff; 
            margin: 0 0 20px 0; 
            font-size: 1.3rem;
            font-weight: 600;
          }
          .payment-info p { 
            margin: 8px 0; 
            color: #cccccc;
            font-size: 0.95rem;
          }
          .payment-info strong { 
            color: #ffffff;
            font-weight: 600;
          }
          .legal-section { 
            padding: 40px; 
            background: #1a1a1a;
            border-top: 1px solid #333333;
          }
          .legal-section h3 { 
            color: #ffffff; 
            margin: 0 0 15px 0; 
            font-size: 1.1rem;
            font-weight: 600;
          }
          .legal-section p { 
            margin: 8px 0; 
            color: #cccccc;
            font-size: 0.85rem;
            line-height: 1.5;
          }
          .footer { 
            padding: 20px 40px; 
            background: #1a1a1a; 
            color: #cccccc;
            text-align: center;
            font-size: 0.85rem;
            border-top: 1px solid #333333;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-approved { background: #dbeafe; color: #1e40af; }
          .status-paid { background: #d1fae5; color: #065f46; }
          .status-fulfilled { background: #e0e7ff; color: #3730a3; }
          .status-draft { background: #f3f4f6; color: #374151; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <h1>Albi Logistics LLC</h1>
            <p>3761 SW 139 PL, Miami FL 33175</p>
            <p>info@albilogistics.com | 786-991-5075</p>
            <p>Tax ID: 85-1234567 | Business License: BL-2024-001</p>
          </div>

          <div class="invoice-details">
            <div class="invoice-grid">
              <div class="invoice-info">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
                <p><strong>Date:</strong> ${today}</p>
                <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${order.status || 'draft'}">${order.status || 'draft'}</span></p>
                <p><strong>Terms:</strong> ${order.paymentTerms || 'Net 30'}</p>
                ${order.isFinanced ? `<p><strong>Financing:</strong> <span class="status-badge status-active">FINANCED</span></p>` : ''}
              </div>
              <div class="customer-info">
                <h3>Bill To:</h3>
                <p><strong>${order.customer.company}</strong></p>
                <p>${order.customer.contact}</p>
                <p>${order.customer.email}</p>
                <p>${order.customer.phone}</p>
                <p>${order.customer.address}</p>
              </div>
            </div>
          </div>

          <div class="items-section">
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Grade</th>
                  <th>Capacity</th>
                  <th>Color</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td><strong>${item.model}</strong></td>
                    <td>${item.grade}</td>
                    <td>${item.capacity}</td>
                    <td>${item.color}</td>
                    <td>${item.quantity}</td>
                    <td>$${(item.finalPrice || item.customerPrice || item.sellPrice || item.unitPrice).toFixed(2)}</td>
                    <td><strong>$${((item.finalPrice || item.customerPrice || item.sellPrice || item.unitPrice) * item.quantity).toFixed(2)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="totals-section">
            <div class="totals-grid">
              <div class="totals-left">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>$${order.subtotal.toFixed(2)}</span>
                </div>
                ${order.fees.map(fee => `
                  <div class="total-row">
                    <span>${fee.label}:</span>
                    <span>$${fee.amount.toFixed(2)}</span>
                  </div>
                `).join('')}
                ${order.discount && order.discount.amount > 0 ? `
                  <div class="total-row" style="color: #10b981;">
                    <span>${order.discount.type === 'percentage' ? order.discount.value + '% Discount' : 'Discount'}:</span>
                    <span>-$${order.discount.amount.toFixed(2)}</span>
                  </div>
                ` : ''}
                <div class="total-row grand">
                  <span>Total Amount:</span>
                  <span>$${order.total.toFixed(2)}</span>
                </div>
              </div>
              <div class="totals-right">
                <p><strong>Payment Terms:</strong> ${order.paymentTerms || 'Net 30'}</p>
                <p><strong>Tax:</strong> Included</p>
                ${order.discount && order.discount.reason ? `
                  <p><strong>Discount Reason:</strong> ${order.discount.reason}</p>
                ` : ''}
                ${order.isFinanced && order.financing ? `
                  <p><strong>Financing Rate:</strong> ${order.financing.interestRate}% every ${order.financing.interestPeriod} days</p>
                  <p><strong>Financed Amount:</strong> $${order.financing.financedAmount.toFixed(2)}</p>
                  <p><strong>Next Interest Date:</strong> ${new Date(order.financing.nextInterestDate).toLocaleDateString()}</p>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="payment-section">
            <div class="payment-grid">
              <div class="payment-info">
                <h3>Payment Instructions</h3>
                <p><strong>Bank:</strong> JP Morgan Chase Bank</p>
                <p><strong>Beneficiary:</strong> ALBI LOGISTICS LLC</p>
                <p><strong>Account #:</strong> 267084131</p>
                <p><strong>Routing:</strong> 021000021</p>
                <p><strong>Address:</strong> 10795 NW 58th St, Miami FL 33178</p>
                <p><strong>Email:</strong> albilogisticsllc@gmail.com</p>
                <p><strong>Reference:</strong> Invoice ${invoiceNumber}</p>
              </div>
              <div class="payment-info">
                <h3>Alternative Payment</h3>
                <p><strong>Zelle:</strong> albilogisticsllc@gmail.com</p>
                <p><strong>PayPal:</strong> pay@albilogistics.com</p>
                <p><strong>Check:</strong> Payable to Albi Logistics LLC</p>
                <p><strong>Mail to:</strong> 3761 SW 139 PL, Miami FL 33175</p>
              </div>
            </div>
          </div>

          <div class="legal-section">
            <h3>Legal Information & Terms</h3>
            <p><strong>Tax Information:</strong> This invoice is subject to applicable sales tax. Albi Logistics LLC is registered for sales tax in Florida (Tax ID: 85-1234567).</p>
            <p><strong>Warranty:</strong> All products carry manufacturer warranty. Additional warranty terms available upon request.</p>
            <p><strong>Returns:</strong> Returns accepted within 14 days of delivery in original condition. Restocking fee may apply.</p>
            <p><strong>Shipping:</strong> Delivery within 5-7 business days. Expedited shipping available at additional cost.</p>

            <p><strong>Dispute Resolution:</strong> Any disputes must be submitted in writing within 30 days of invoice date.</p>
          </div>

          <div class="footer">
            <p>Thank you for your business! | Albi Logistics LLC | 3761 SW 139 PL, Miami FL 33175 | info@albilogistics.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="flex-grow bg-black overflow-y-auto">
      {/* Header */}
      <div className="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-zinc-800 bg-black sticky top-0 z-30">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center text-3xl text-white">
            <CreditCard className="w-8 h-8 mr-3 text-blue-400" />
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-400">
              {cart.length} items • ${getCartTotal().toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sm:p-7 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer & Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Customer Information</h2>
                </div>
                <button
                  onClick={() => setShowCreateCustomer(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Customer</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Select Customer
                  </label>
                  <select
                    value={selectedCustomer?.id || ''}
                    onChange={(e) => {
                      const customer = customers.find(c => c.id === parseInt(e.target.value));
                      setSelectedCustomer(customer);
                    }}
                    className="input-premium w-full"
                  >
                    <option value="">Choose a customer...</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.company} - {customer.contact}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCustomer && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                    <div className="flex items-center space-x-3">
                      <Building className="w-4 h-4 text-zinc-400" />
                      <div>
                        <p className="text-sm text-zinc-400">Company</p>
                        <p className="text-white font-medium">{selectedCustomer.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-zinc-400" />
                      <div>
                        <p className="text-sm text-zinc-400">Contact</p>
                        <p className="text-white font-medium">{selectedCustomer.contact}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-zinc-400" />
                      <div>
                        <p className="text-sm text-zinc-400">Email</p>
                        <p className="text-white font-medium">{selectedCustomer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-zinc-400" />
                      <div>
                        <p className="text-sm text-zinc-400">Phone</p>
                        <p className="text-white font-medium">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 md:col-span-2">
                      <MapPin className="w-4 h-4 text-zinc-400" />
                      <div>
                        <p className="text-sm text-zinc-400">Address</p>
                        <p className="text-white font-medium">{selectedCustomer.address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="premium-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Order Summary</h2>
              </div>
              
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${item.grade}-${item.capacity}-${item.color}-${item.market}`} className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/30">
                    <div className="flex-1">
                      <div className="font-medium text-white">{item.model}</div>
                      <div className="text-sm text-zinc-400">
                        {item.grade} • {item.capacity} • {item.color}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-white font-medium">${(item.finalPrice || item.customerPrice || item.sellPrice).toFixed(2)}</div>
                        <div className="text-xs text-zinc-400">per unit</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-medium">{item.quantity}</div>
                        <div className="text-xs text-zinc-400">qty</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-400 font-medium">
                          ${((item.finalPrice || item.customerPrice || item.sellPrice) * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-xs text-zinc-400">total</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Fees */}
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Additional Fees</h2>
                </div>
                <button
                  onClick={() => setShowAddFee(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Fee</span>
                </button>
              </div>

              {showAddFee && (
                <div className="mb-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Fee Label</label>
                      <input
                        type="text"
                        value={newFeeLabel}
                        onChange={(e) => setNewFeeLabel(e.target.value)}
                        placeholder="e.g., Shipping, Tax"
                        className="input-premium w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Amount</label>
                      <input
                        type="number"
                        value={newFeeAmount}
                        onChange={(e) => setNewFeeAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        className="input-premium w-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <button
                      onClick={handleAddFee}
                      className="px-3 py-2 text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-all duration-200"
                    >
                      Add Fee
                    </button>
                    <button
                      onClick={() => {
                        setShowAddFee(false);
                        setNewFeeLabel('');
                        setNewFeeAmount('');
                      }}
                      className="px-3 py-2 text-sm bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/30 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {additionalFees.map(fee => (
                  <div key={fee.id} className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/30">
                    {editingFee === fee.id ? (
                      <div className="flex items-center space-x-4 flex-1">
                        <input
                          type="text"
                          value={fee.label}
                          onChange={(e) => updateFee(fee.id, e.target.value, fee.amount)}
                          className="input-premium flex-1"
                        />
                        <input
                          type="number"
                          value={fee.amount}
                          onChange={(e) => updateFee(fee.id, fee.label, parseFloat(e.target.value))}
                          step="0.01"
                          className="input-premium w-24"
                        />
                        <button
                          onClick={() => setEditingFee(null)}
                          className="p-1 text-green-400 hover:text-green-300"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="text-white font-medium">{fee.label}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-blue-400 font-medium">${fee.amount.toFixed(2)}</div>
                          <button
                            onClick={() => setEditingFee(fee.id)}
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFee(fee.id)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Discount Section */}
            <div className="premium-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <DollarSign className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-white">Discount</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Discount Value</label>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === 'percentage' ? '10' : '50.00'}
                      step={discountType === 'percentage' ? '1' : '0.01'}
                      className="input-premium w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Reason (Optional)</label>
                    <input
                      type="text"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      placeholder="e.g., Bulk order, Loyalty"
                      className="input-premium w-full"
                    />
                  </div>
                </div>
                
                {discountValue && parseFloat(discountValue) > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-medium">
                        {discountType === 'percentage' ? `${discountValue}% Discount` : `$${discountValue} Discount`}
                      </span>
                      <span className="text-green-400 font-medium">
                        -${(() => {
                          const subtotal = getCartSubtotal();
                          if (discountType === 'percentage') {
                            return (subtotal * parseFloat(discountValue) / 100).toFixed(2);
                          } else {
                            return parseFloat(discountValue).toFixed(2);
                          }
                        })()}
                      </span>
                    </div>
                    {discountReason && (
                      <p className="text-sm text-green-300 mt-1">Reason: {discountReason}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Financing Section */}
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Financing Options</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-zinc-400">Finance Order</span>
                  <button
                    onClick={() => setIsFinanced(!isFinanced)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isFinanced ? 'bg-purple-500' : 'bg-zinc-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isFinanced ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {isFinanced && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Interest Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={financingDetails.interestRate}
                        onChange={(e) => setFinancingDetails({
                          ...financingDetails,
                          interestRate: parseFloat(e.target.value) || 0
                        })}
                        className="input-premium w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Interest Period (days)</label>
                      <input
                        type="number"
                        value={financingDetails.interestPeriod}
                        onChange={(e) => setFinancingDetails({
                          ...financingDetails,
                          interestPeriod: parseInt(e.target.value) || 0
                        })}
                        className="input-premium w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Financed Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={financingDetails.financedAmount}
                        onChange={(e) => setFinancingDetails({
                          ...financingDetails,
                          financedAmount: parseFloat(e.target.value) || 0
                        })}
                        placeholder="Enter amount to finance"
                        className="input-premium w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-medium">Financing Summary</span>
                      <span className="text-purple-400 font-medium">
                        {financingDetails.interestRate}% every {financingDetails.interestPeriod} days
                      </span>
                    </div>
                    <div className="text-sm text-purple-300 mt-1">
                      Next interest date: {(() => {
                        const startDate = new Date(financingDetails.startDate);
                        startDate.setDate(startDate.getDate() + financingDetails.interestPeriod);
                        return startDate.toLocaleDateString();
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Total & Actions */}
          <div className="space-y-6">
            {/* Order Total */}
            <div className="premium-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Order Total</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white">${getCartSubtotal().toFixed(2)}</span>
                </div>
                
                {additionalFees.map(fee => (
                  <div key={fee.id} className="flex justify-between">
                    <span className="text-zinc-400">{fee.label}</span>
                    <span className="text-white">${fee.amount.toFixed(2)}</span>
                  </div>
                ))}
                
                {discountValue && parseFloat(discountValue) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-400">
                      {discountType === 'percentage' ? `${discountValue}% Discount` : 'Discount'}
                    </span>
                    <span className="text-green-400">
                      -${(() => {
                        const subtotal = getCartSubtotal();
                        if (discountType === 'percentage') {
                          return (subtotal * parseFloat(discountValue) / 100).toFixed(2);
                        } else {
                          return parseFloat(discountValue).toFixed(2);
                        }
                      })()}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-zinc-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-lg font-semibold text-blue-400">
                      ${(() => {
                        const subtotal = getCartSubtotal();
                        const feesTotal = getFeesTotal();
                        let discountAmount = 0;
                        
                        if (discountValue && parseFloat(discountValue) > 0) {
                          if (discountType === 'percentage') {
                            discountAmount = subtotal * (parseFloat(discountValue) / 100);
                          } else {
                            discountAmount = parseFloat(discountValue);
                          }
                        }
                        
                        return (subtotal + feesTotal - discountAmount).toFixed(2);
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="premium-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
              
              {/* Payment Due Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-premium w-full"
                />
                <div className="text-xs text-zinc-400 mt-1">
                  Select when payment is due
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleCreateOrder}
                  disabled={loading || !selectedCustomer || cart.length === 0}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span>{loading ? 'Creating Order...' : 'Create Order'}</span>
                </button>
                
                <button
                  onClick={handleGenerateInvoice}
                  disabled={loading || !selectedCustomer || cart.length === 0}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
                >
                  <FileText className="w-5 h-5" />
                  <span>Generate Invoice</span>
                </button>
                
                <button
                  onClick={() => {/* Navigate to financing page with order data */}}
                  disabled={loading || !selectedCustomer || cart.length === 0}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Finance Order</span>
                </button>
                
                <button
                  onClick={clearCart}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-all duration-200"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Clear Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Creation Modal */}
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
                  className="input-premium w-full"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Contact Person *</label>
                <input
                  type="text"
                  value={newCustomer.contact}
                  onChange={(e) => setNewCustomer({ ...newCustomer, contact: e.target.value })}
                  className="input-premium w-full"
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="input-premium w-full"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="input-premium w-full"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Address</label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="input-premium w-full"
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

export default Checkout; 