const express = require('express');
const { Op } = require('sequelize');
const { recalculateAllPrices, getMarketSettings, saveMarketSettings, clearSettingsCache } = require('../services/marketSettings');
const { PriceHistory, Product } = require('../models');

const router = express.Router();

// Get market settings
router.get('/market-settings', async (req, res) => {
  try {
    const { market = 'VE' } = req.query;
    const settings = await getMarketSettings(market);
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching market settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market settings'
    });
  }
});

// Save market settings and recalculate prices
router.post('/market-settings', async (req, res) => {
  try {
    const { settings, market = 'VE' } = req.body;
    console.log('[POST /market-settings] Received:', { market, settings });
    
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Settings are required'
      });
    }
    
    // Save settings to database
    await saveMarketSettings(market, settings);
    
    // Recalculate all prices
    const result = await recalculateAllPrices();
    
    res.json({
      success: true,
      message: 'Settings saved and prices recalculated',
      data: {
        updatedCount: result.updatedCount,
        priceHistoryCount: result.priceHistoryCount
      }
    });
  } catch (error) {
    console.error('Error saving market settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save market settings'
    });
  }
});

// Recalculate all prices
router.post('/recalculate-prices', async (req, res) => {
  try {
    const result = await recalculateAllPrices();
    
    res.json({
      success: true,
      message: 'Prices recalculated successfully',
      data: {
        updatedCount: result.updatedCount,
        priceHistoryCount: result.priceHistoryCount
      }
    });
  } catch (error) {
    console.error('Error recalculating prices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recalculate prices'
    });
  }
});

// Get price history
router.get('/price-history', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      productId,
      changeType,
      startDate,
      endDate 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (productId) {
      whereClause.productId = productId;
    }
    
    if (changeType) {
      whereClause.changeType = changeType;
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.$gte = new Date(startDate);
      if (endDate) whereClause.createdAt.$lte = new Date(endDate);
    }
    
    const { count, rows: history } = await PriceHistory.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: Product,
        as: 'product',
        attributes: ['model', 'grade', 'capacity', 'color', 'market']
      }]
    });
    
    res.json({
      success: true,
      data: {
        history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price history'
    });
  }
});

// Get price history analytics
router.get('/price-history/analytics', async (req, res) => {
  try {
    const { dateRange = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const history = await PriceHistory.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['model', 'grade', 'capacity', 'color', 'market']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate analytics
    const totalChanges = history.length;
    const priceIncreases = history.filter(item => parseFloat(item.newPrice) > parseFloat(item.oldPrice)).length;
    const priceDecreases = history.filter(item => parseFloat(item.newPrice) < parseFloat(item.oldPrice)).length;
    const averageChange = history.length > 0 
      ? history.reduce((sum, item) => sum + (parseFloat(item.newPrice) - parseFloat(item.oldPrice)), 0) / history.length
      : 0;
    
    // Group by model for trend analysis
    const modelChanges = {};
    history.forEach(item => {
      const modelKey = `${item.product?.model}-${item.product?.grade}`;
      if (!modelChanges[modelKey]) {
        modelChanges[modelKey] = {
          model: item.product?.model,
          grade: item.product?.grade,
          changes: 0,
          totalChange: 0
        };
      }
      modelChanges[modelKey].changes++;
      modelChanges[modelKey].totalChange += parseFloat(item.newPrice) - parseFloat(item.oldPrice);
    });
    
    const mostChangedModels = Object.values(modelChanges)
      .sort((a, b) => b.changes - a.changes)
      .slice(0, 5);
    
    res.json({
      success: true,
      data: {
        totalChanges,
        priceIncreases,
        priceDecreases,
        averageChange: Math.round(averageChange * 100) / 100,
        mostChangedModels,
        period: dateRange
      }
    });
  } catch (error) {
    console.error('Error fetching price history analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price history analytics'
    });
  }
});

// Get all market settings (US and VE)
router.get('/all-market-settings', async (req, res) => {
  try {
    const veSettings = await getMarketSettings('VE');
    const usSettings = await getMarketSettings('US');
    res.json({
      success: true,
      data: {
        VE: veSettings,
        US: usSettings
      }
    });
  } catch (error) {
    console.error('Error fetching all market settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all market settings'
    });
  }
});

// Debug endpoint: get full calculation breakdown for a product
router.get('/debug-product', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, message: 'Product id required' });
    const { Product } = require('../models');
    const { getMarketSettings, calculateSellPrice, calculateCommission } = require('../services/marketSettings');
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const market = product.market || 'VE';
    const settings = await getMarketSettings(market);
    const basePrice = parseFloat(product.basePrice) || 0;
    const shippingCost = settings.usShipping || 0;
    const boxCost = settings.box || 0;
    const cableCost = settings.cable || 0;
    const chargerCost = settings.charger || 0;
    const totalCost = basePrice + shippingCost + boxCost + cableCost + chargerCost;
    const sellPrice = await calculateSellPrice(totalCost, market);
    const profit = sellPrice - totalCost;
    const commission = await calculateCommission(sellPrice, market);
    const finalPrice = sellPrice + commission;
    res.json({
      success: true,
      data: {
        product: product.toJSON(),
        settings,
        basePrice,
        shippingCost,
        boxCost,
        cableCost,
        chargerCost,
        totalCost,
        sellPrice,
        profit,
        commission,
        finalPrice
      }
    });
  } catch (error) {
    console.error('Error in debug-product:', error);
    res.status(500).json({ success: false, message: 'Failed to debug product' });
  }
});

module.exports = router; 