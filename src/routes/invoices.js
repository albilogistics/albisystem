const express = require('express');
const PDFGenerator = require('../services/pdfGenerator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const pdfGenerator = new PDFGenerator();

// GET /api/invoices - Get all invoices
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Fetch invoices from database
    const invoices = await Order.findAll({
      include: [
        { model: User, as: 'user' },
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payments' },
        { model: OrderStatusHistory, as: 'statusHistory', include: [{ model: User, as: 'changedByUser' }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform to invoice format
    const invoiceData = invoices.map(order => ({
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
      dueDate: order.paymentDueDate || new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 30)
    }));

    res.json({
      success: true,
      data: invoiceData
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/invoices - Save new invoice
router.post('/', authenticateToken, async (req, res) => {
  try {
    const invoiceData = req.body;
    
    // Create order from invoice data
    const order = await Order.create({
      orderNumber: invoiceData.invoiceNumber.replace('INV-', ''),
      userId: req.user.id,
      status: invoiceData.status || 'draft',
      totalAmount: invoiceData.total,
      shippingAddress: invoiceData.customer?.address || '',
      billingAddress: invoiceData.customer?.address || '',
      notes: invoiceData.notes || '',
      paymentDueDate: new Date(invoiceData.dueDate),
      remindersEnabled: true
    });

    // Create order items
    if (invoiceData.items && invoiceData.items.length > 0) {
      await Promise.all(invoiceData.items.map(item => 
        OrderItem.create({
          orderId: order.id,
          productName: item.model,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          grade: item.grade,
          condition: item.capacity
        })
      ));
    }

    res.json({
      success: true,
      data: { id: order.id, invoiceNumber: invoiceData.invoiceNumber },
      message: 'Invoice saved successfully'
    });
  } catch (error) {
    console.error('Error saving invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/invoices/generate - Generate PDF invoice
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const invoiceData = req.body;
    
    // Validate required fields
    if (!invoiceData.invoiceNumber || !invoiceData.customer || !invoiceData.items) {
      return res.status(400).json({
        success: false,
        error: 'Missing required invoice data'
      });
    }

    // Generate PDF
    const pdfBuffer = await pdfGenerator.generateInvoicePDF(invoiceData);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF buffer
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/invoices/preview - Preview invoice HTML
router.post('/preview', authenticateToken, async (req, res) => {
  try {
    const invoiceData = req.body;
    
    // Generate HTML preview
    const html = pdfGenerator.generateInvoiceHTML(invoiceData);
    
    res.json({
      success: true,
      data: { html }
    });
    
  } catch (error) {
    console.error('Error generating invoice preview:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cleanup on server shutdown
process.on('SIGINT', async () => {
  await pdfGenerator.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pdfGenerator.close();
  process.exit(0);
});

module.exports = router; 