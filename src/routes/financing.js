const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Financing, FinancingPayment, FinancingSettings, Order, User, OrderItem } = require('../models');
const router = express.Router();

// GET /api/financing - Get all financed orders
router.get('/', async (req, res) => {
  try {
    const financedOrders = await Financing.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user'
            },
            {
              model: OrderItem,
              as: 'items'
            }
          ]
        },
        {
          model: User,
          as: 'user'
        },
        {
          model: FinancingPayment,
          as: 'payments',
          order: [['createdAt', 'DESC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: financedOrders
    });
  } catch (error) {
    console.error('Error fetching financed orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financed orders',
      error: error.message
    });
  }
});

// GET /api/financing/analytics - Get financing analytics (MUST BE BEFORE /:id)
router.get('/analytics', async (req, res) => {
  try {
    const allFinancing = await Financing.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          include: [{ model: User, as: 'user' }]
        }
      ]
    });

    const totalFinanced = allFinancing.reduce((sum, f) => sum + parseFloat(f.financedAmount), 0);
    const totalInterest = allFinancing.reduce((sum, f) => sum + parseFloat(f.totalInterestPaid), 0);
    const activeFinancing = allFinancing.filter(f => f.status === 'active');
    const overdueFinancing = allFinancing.filter(f => {
      const nextDate = new Date(f.nextInterestDate);
      return nextDate < new Date() && f.status === 'active';
    });

    const analytics = {
      totalFinanced,
      totalInterest,
      activeCount: activeFinancing.length,
      overdueCount: overdueFinancing.length,
      totalCount: allFinancing.length,
      averageInterestRate: allFinancing.length > 0 
        ? allFinancing.reduce((sum, f) => sum + parseFloat(f.interestRate), 0) / allFinancing.length 
        : 0,
      revenue: totalInterest
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching financing analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financing analytics',
      error: error.message
    });
  }
});

// GET /api/financing/settings - Get financing settings (MUST BE BEFORE /:id)
router.get('/settings', async (req, res) => {
  try {
    let settings = await FinancingSettings.findOne();
    
    if (!settings) {
      // Create default settings
      settings = await FinancingSettings.create({
        defaultInterestRate: 1.50,
        defaultInterestPeriod: 7,
        autoCalculateInterest: true,
        sendReminders: true,
        reminderDays: 3,
        lateFeeRate: 5.00,
        taxRate: 0.00,
        gracePeriod: 3
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching financing settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financing settings',
      error: error.message
    });
  }
});

// GET /api/financing/:id - Get specific financed order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const financing = await Financing.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user'
            },
            {
              model: OrderItem,
              as: 'items'
            }
          ]
        },
        {
          model: User,
          as: 'user'
        },
        {
          model: FinancingPayment,
          as: 'payments',
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!financing) {
      return res.status(404).json({
        success: false,
        message: 'Financed order not found'
      });
    }

    res.json({
      success: true,
      data: financing
    });
  } catch (error) {
    console.error('Error fetching financed order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financed order',
      error: error.message
    });
  }
});

// POST /api/financing - Create new financing
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      orderId,
      interestRate,
      interestPeriod,
      financedAmount,
      startDate,
      notes
    } = req.body;

    // Validate required fields
    if (!orderId || !financedAmount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and financed amount are required'
      });
    }

    // Check if order exists and get user
    const order = await Order.findByPk(orderId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if financing already exists for this order
    const existingFinancing = await Financing.findOne({
      where: { orderId }
    });

    if (existingFinancing) {
      return res.status(400).json({
        success: false,
        message: 'Financing already exists for this order'
      });
    }

    // Calculate next interest date
    const nextInterestDate = new Date(startDate || new Date());
    nextInterestDate.setDate(nextInterestDate.getDate() + (interestPeriod || 7));

    // Create financing record
    const financing = await Financing.create({
      orderId,
      userId: order.userId,
      interestRate: interestRate || 1.50,
      interestPeriod: interestPeriod || 7,
      financedAmount,
      startDate: startDate || new Date(),
      nextInterestDate,
      remainingBalance: financedAmount,
      status: 'active',
      notes
    });

    // Update order to mark as financed
    await order.update({
      isFinanced: true,
      financingDetails: {
        interestRate: financing.interestRate,
        interestPeriod: financing.interestPeriod,
        financedAmount: financing.financedAmount,
        startDate: financing.startDate,
        nextInterestDate: financing.nextInterestDate
      }
    });

    res.json({
      success: true,
      data: financing,
      message: 'Financing created successfully'
    });
  } catch (error) {
    console.error('Error creating financing:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating financing',
      error: error.message
    });
  }
});

// PUT /api/financing/:id - Update financing
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const financing = await Financing.findByPk(req.params.id);
    
    if (!financing) {
      return res.status(404).json({
        success: false,
        message: 'Financing not found'
      });
    }

    const updatedFinancing = await financing.update(req.body);
    
    res.json({
      success: true,
      data: updatedFinancing,
      message: 'Financing updated successfully'
    });
  } catch (error) {
    console.error('Error updating financing:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating financing',
      error: error.message
    });
  }
});

// POST /api/financing/:id/payment - Add payment to financing
router.post('/:id/payment', authenticateToken, async (req, res) => {
  try {
    const {
      amount,
      paymentType,
      interestAmount,
      principalAmount,
      paymentMethod,
      reference,
      notes
    } = req.body;

    const financing = await Financing.findByPk(req.params.id);
    
    if (!financing) {
      return res.status(404).json({
        success: false,
        message: 'Financing not found'
      });
    }

    // Create payment record
    const payment = await FinancingPayment.create({
      financingId: financing.id,
      amount,
      paymentType: paymentType || 'both',
      interestAmount: interestAmount || 0,
      principalAmount: principalAmount || amount,
      paymentDate: new Date(),
      paymentMethod,
      reference,
      notes
    });

    // Update financing totals
    const newTotalInterestPaid = parseFloat(financing.totalInterestPaid) + parseFloat(payment.interestAmount);
    const newTotalAmountPaid = parseFloat(financing.totalAmountPaid) + parseFloat(amount);
    const newRemainingBalance = parseFloat(financing.remainingBalance) - parseFloat(payment.principalAmount);

    await financing.update({
      totalInterestPaid: newTotalInterestPaid,
      totalAmountPaid: newTotalAmountPaid,
      remainingBalance: Math.max(0, newRemainingBalance),
      status: newRemainingBalance <= 0 ? 'paid' : 'active'
    });

    res.json({
      success: true,
      data: payment,
      message: 'Payment added successfully'
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding payment',
      error: error.message
    });
  }
});

// POST /api/financing/:id/calculate-interest - Calculate and add interest
router.post('/:id/calculate-interest', authenticateToken, async (req, res) => {
  try {
    const financing = await Financing.findByPk(req.params.id);
    
    if (!financing) {
      return res.status(404).json({
        success: false,
        message: 'Financing not found'
      });
    }

    const now = new Date();
    const nextInterestDate = new Date(financing.nextInterestDate);
    
    if (now >= nextInterestDate) {
      // Calculate interest amount
      const interestAmount = (parseFloat(financing.remainingBalance) * parseFloat(financing.interestRate)) / 100;
      
      // Create interest payment record
      await FinancingPayment.create({
        financingId: financing.id,
        amount: interestAmount,
        paymentType: 'interest',
        interestAmount,
        principalAmount: 0,
        paymentDate: now,
        paymentMethod: 'auto',
        reference: 'Interest Calculation',
        notes: `Automatic interest calculation for ${financing.interestRate}%`
      });

      // Update financing
      const newNextInterestDate = new Date(nextInterestDate);
      newNextInterestDate.setDate(newNextInterestDate.getDate() + financing.interestPeriod);
      
      await financing.update({
        totalInterestPaid: parseFloat(financing.totalInterestPaid) + interestAmount,
        nextInterestDate: newNextInterestDate,
        lastInterestCalculation: now
      });

      res.json({
        success: true,
        message: 'Interest calculated and added successfully',
        data: {
          interestAmount,
          nextInterestDate: newNextInterestDate
        }
      });
    } else {
      res.json({
        success: true,
        message: 'Interest not due yet',
        data: {
          nextInterestDate: financing.nextInterestDate
        }
      });
    }
  } catch (error) {
    console.error('Error calculating interest:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating interest',
      error: error.message
    });
  }
});

// PUT /api/financing/settings - Update financing settings
router.put('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let settings = await FinancingSettings.findOne();
    
    if (!settings) {
      settings = await FinancingSettings.create(req.body);
    } else {
      settings = await settings.update(req.body);
    }

    res.json({
      success: true,
      data: settings,
      message: 'Financing settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating financing settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating financing settings',
      error: error.message
    });
  }
});

module.exports = router; 