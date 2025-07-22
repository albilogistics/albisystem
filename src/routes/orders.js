const express = require('express');
const { authenticateToken, requireCustomer, requireAdmin } = require('../middleware/auth');
const { Order, OrderItem, Payment, OrderStatusHistory, User } = require('../models');

const router = express.Router();

// Get all orders for the authenticated user
router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: 1 }, // Default user ID for now
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email', 'company']
        },
        {
          model: OrderItem,
          as: 'items'
        },
        {
          model: Payment,
          as: 'payments'
        },
        {
          model: OrderStatusHistory,
          as: 'statusHistory',
          include: [
            {
              model: User,
              as: 'changedByUser',
              attributes: ['firstName', 'lastName']
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ],
      order: [['createdAt', 'DESC']],
      attributes: {
        exclude: ['paymentDueDate', 'remindersEnabled'] // Exclude problematic columns
      }
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Get a specific order by ID
router.get('/:orderId', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { 
        id: req.params.orderId,
        userId: req.user.id 
      },
      include: [
        {
          model: OrderItem,
          as: 'items'
        },
        {
          model: Payment,
          as: 'payments'
        },
        {
          model: OrderStatusHistory,
          as: 'statusHistory',
          include: [
            {
              model: User,
              as: 'changedByUser',
              attributes: ['firstName', 'lastName']
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { 
      items, 
      shippingAddress, 
      billingAddress, 
      notes, 
      isFinanced, 
      financing 
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    // Create order with provided addresses
    const order = await Order.create({
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: 1, // Default user ID for now
      totalAmount,
      shippingAddress: shippingAddress || 'Address to be provided',
      billingAddress: billingAddress || 'Address to be provided',
      notes: notes || '',
      status: 'pending',
      paymentDueDate: req.body.paymentDueDate ? new Date(req.body.paymentDueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      remindersEnabled: req.body.remindersEnabled !== undefined ? req.body.remindersEnabled : true,
      isFinanced: isFinanced || false,
      financingDetails: financing || null
    });

    // Create order items
    const orderItems = await Promise.all(
      items.map(item => 
        OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          grade: item.grade,
          condition: item.capacity || item.condition // Use capacity if available, fallback to condition
        })
      )
    );

    // Create initial status history
    await OrderStatusHistory.create({
      orderId: order.id,
      status: 'pending',
      changedBy: 1, // Default user ID for now
      notes: 'Order created'
    });

    // Create financing if requested
    let financingRecord = null;
    if (isFinanced && financing) {
      const { Financing } = require('../models');
      
      // Calculate next interest date
      const startDate = new Date(financing.startDate || new Date());
      const nextInterestDate = new Date(startDate);
      nextInterestDate.setDate(nextInterestDate.getDate() + (financing.interestPeriod || 7));

      financingRecord = await Financing.create({
        orderId: order.id,
        userId: order.userId,
        interestRate: financing.interestRate || 1.50,
        interestPeriod: financing.interestPeriod || 7,
        financedAmount: financing.financedAmount || totalAmount,
        startDate: startDate,
        nextInterestDate,
        remainingBalance: financing.financedAmount || totalAmount,
        status: 'active',
        notes: financing.notes || null
      });
    }

    // Fetch the complete order with items and user
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email', 'company']
        },
        {
          model: OrderItem,
          as: 'items'
        },
        {
          model: OrderStatusHistory,
          as: 'statusHistory'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: completeOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// Admin routes for order management
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email', 'company']
        },
        {
          model: OrderItem,
          as: 'items'
        },
        {
          model: Payment,
          as: 'payments'
        },
        {
          model: OrderStatusHistory,
          as: 'statusHistory',
          include: [
            {
              model: User,
              as: 'changedByUser',
              attributes: ['firstName', 'lastName']
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Update order status
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email', 'company']
        },
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    await order.update({ status });

    // Create status history entry
    await OrderStatusHistory.create({
      orderId: order.id,
      status,
      changedBy: 1, // Default user ID for now
      notes: notes || `Status changed to ${status}`
    });

    // Handle specific status updates
    if (status === 'shipped') {
      await order.update({ shippedAt: new Date() });
    } else if (status === 'delivered') {
      await order.update({ deliveredAt: new Date() });
    } else if (status === 'approved') {
      // Generate invoice when order is approved
      try {
        const PDFGenerator = require('../services/pdfGenerator');
        const pdfGenerator = new PDFGenerator();
        
        // Prepare invoice data
        const invoiceData = {
          invoiceNumber: `INV-${order.orderNumber}`,
          customer: {
            company: order.user?.company || 'Unknown Company',
            contact: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Unknown Contact',
            email: order.user?.email || 'No email provided',
            phone: order.user?.phone || 'No phone provided',
            address: order.shippingAddress || 'Address to be provided'
          },
          items: order.items?.map(item => ({
            model: item.productName || 'Unknown Product',
            grade: item.grade || 'Unknown',
            capacity: item.condition || 'Unknown',
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice) || 0
          })) || [],
          fees: [],
          total: parseFloat(order.totalAmount) || 0,
          status: 'draft',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        // Generate PDF
        const pdfBuffer = await pdfGenerator.generateInvoicePDF(invoiceData);
        
        // Save PDF to file system
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const pdfPath = path.join(uploadsDir, `invoice-${order.orderNumber}.pdf`);
        fs.writeFileSync(pdfPath, pdfBuffer);
        
        // Update order with invoice URL
        await order.update({
          invoiceUrl: `/uploads/invoice-${order.orderNumber}.pdf`
        });

        await pdfGenerator.close();
        
        console.log(`Invoice generated for order ${order.orderNumber}`);
      } catch (pdfError) {
        console.error('Error generating invoice PDF:', pdfError);
        // Don't fail the order status update if PDF generation fails
      }
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { 
        order, 
        invoiceGenerated: status === 'approved'
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// Add payment to order (admin only)
router.post('/:orderId/payments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, notes } = req.body;
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const payment = await Payment.create({
      orderId: order.id,
      amount,
      paymentMethod,
      transactionId,
      notes,
      status: 'completed',
      paymentDate: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Payment added successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add payment'
    });
  }
});

// Update order with invoice/estimate URLs (admin only)
router.patch('/:orderId/documents', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { estimateUrl, invoiceUrl, paymentInstructions } = req.body;
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.update({
      estimateUrl,
      invoiceUrl,
      paymentInstructions
    });

    res.json({
      success: true,
      message: 'Order documents updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order documents'
    });
  }
});

module.exports = router; 