const express = require('express');
const { authenticateToken, requireAdminOrCustomer } = require('../middleware/auth');
const { Product } = require('../models');
const { Op } = require('sequelize');
const { getMarketSettings } = require('../services/marketSettings');

const router = express.Router();

// Public endpoint for client portal (no authentication required)
router.get('/public', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      grade = '',
      model = '',
      color = '',
      capacity = '',
      minPrice = '',
      maxPrice = '',
      inStock = ''
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = {
      status: 'Active'
    };

    if (search) {
      whereClause[Op.or] = [
        { model: { [Op.like]: `%${search}%` } },
        { grade: { [Op.like]: `%${search}%` } },
        { color: { [Op.like]: `%${search}%` } },
        { capacity: { [Op.like]: `%${search}%` } }
      ];
    }

    if (grade) {
      whereClause.grade = { [Op.like]: `%${grade}%` };
    }

    if (model) {
      whereClause.model = { [Op.like]: `%${model}%` };
    }

    if (color) {
      whereClause.color = { [Op.like]: `%${color}%` };
    }

    if (capacity) {
      whereClause.capacity = { [Op.like]: `%${capacity}%` };
    }

    if (minPrice || maxPrice) {
      whereClause.sellPrice = {};
      if (minPrice) whereClause.sellPrice[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.sellPrice[Op.lte] = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      whereClause.quantity = { [Op.gt]: 0 };
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['model', 'ASC'], ['sellPrice', 'ASC']]
    });

    // Get unique values for filters
    const grades = await Product.findAll({
      attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('grade')), 'grade']],
      where: { status: 'Active' },
      raw: true
    });

    const models = await Product.findAll({
      attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('model')), 'model']],
      where: { status: 'Active' },
      raw: true
    });

    const colors = await Product.findAll({
      attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('color')), 'color']],
      where: { status: 'Active' },
      raw: true
    });

    const capacities = await Product.findAll({
      attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('capacity')), 'capacity']],
      where: { status: 'Active' },
      raw: true
    });

          // Calculate customer prices using real market settings
      const productsWithCustomerPrices = await Promise.all(products.map(async (product) => {
        const productData = product.toJSON();
        const market = productData.market || 'VE';
        
        // Get real market settings from database
        const marketSettings = await getMarketSettings(market);
        
        // Use the pre-calculated values from the database
        const totalCost = parseFloat(productData.totalCost) || 0;
        const sellPrice = parseFloat(productData.sellPrice) || 0;
        const margin = parseFloat(productData.margin) || 0;
        
        // Calculate commission and customer price based on settings
        let commission = 0;
        if (marketSettings.commissionType === 'percentage') {
          commission = (sellPrice * marketSettings.commissionValue) / 100;
        } else if (marketSettings.commissionType === 'flat') {
          commission = marketSettings.commissionValue;
        }
        
        const customerPrice = sellPrice + commission;
        
        return {
          ...productData,
          finalPrice: customerPrice, // This is the customer price
          customerPrice: customerPrice, // Explicit customer price
          totalCost: totalCost,
          margin: margin,
          marginPercent: margin > 0 ? ((margin / totalCost) * 100).toFixed(2) : '0.00',
          isAvailable: product.isAvailable(),
          inventoryLastUpdated: productData.inventoryLastUpdated ? new Date(productData.inventoryLastUpdated).toLocaleString() : 'Never',
          priceLastUpdated: productData.priceLastUpdated ? new Date(productData.priceLastUpdated).toLocaleString() : 'Never'
        };
      }));

    res.json({
      success: true,
      data: {
        products: productsWithCustomerPrices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        },
        filters: {
          grades: grades.map(g => g.grade).filter(Boolean),
          models: models.map(m => m.model).filter(Boolean),
          colors: colors.map(c => c.color).filter(Boolean),
          capacities: capacities.map(c => c.capacity).filter(Boolean)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      grade = '',
      model = '',
      color = '',
      minPrice = '',
      maxPrice = '',
      inStock = ''
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = {
      status: 'Active'
    };

    if (search) {
      whereClause[Op.or] = [
        { model: { [Op.like]: `%${search}%` } },
        { grade: { [Op.like]: `%${search}%` } },
        { color: { [Op.like]: `%${search}%` } },
        { capacity: { [Op.like]: `%${search}%` } }
      ];
    }

    if (grade) {
      whereClause.grade = { [Op.like]: `%${grade}%` };
    }

    if (model) {
      whereClause.model = { [Op.like]: `%${model}%` };
    }

    if (color) {
      whereClause.color = { [Op.like]: `%${color}%` };
    }

    if (minPrice || maxPrice) {
      whereClause.sellPrice = {};
      if (minPrice) whereClause.sellPrice[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.sellPrice[Op.lte] = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      whereClause.quantity = { [Op.gt]: 0 };
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['model', 'ASC'], ['sellPrice', 'ASC']]
    });

    // Get unique values for filters
    const grades = await Product.findAll({
      attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('grade')), 'grade']],
      where: { status: 'Active' },
      raw: true
    });

    const models = await Product.findAll({
      attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('model')), 'model']],
      where: { status: 'Active' },
      raw: true
    });

    const colors = await Product.findAll({
      attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('color')), 'color']],
      where: { status: 'Active' },
      raw: true
    });

    res.json({
      success: true,
      data: {
        products: products.map(product => ({
          ...product.toJSON(),
          finalPrice: product.getFinalPrice(),
          isAvailable: product.isAvailable()
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        },
        filters: {
          grades: grades.map(g => g.grade).filter(Boolean),
          models: models.map(m => m.model).filter(Boolean),
          colors: colors.map(c => c.color).filter(Boolean)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get a specific product by ID
router.get('/:productId', authenticateToken, requireAdminOrCustomer, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...product.toJSON(),
        finalPrice: product.getFinalPrice(),
        isAvailable: product.isAvailable()
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// Get product statistics
router.get('/stats/summary', authenticateToken, requireAdminOrCustomer, async (req, res) => {
  try {
    const totalProducts = await Product.count({ where: { status: 'Active' } });
    const inStockProducts = await Product.count({ 
      where: { 
        status: 'Active',
        quantity: { [Op.gt]: 0 }
      } 
    });
    const outOfStockProducts = await Product.count({ 
      where: { 
        status: 'Active',
        quantity: { [Op.eq]: 0 }
      } 
    });

    // Get price ranges
    const priceStats = await Product.findOne({
      attributes: [
        [Product.sequelize.fn('MIN', Product.sequelize.col('sellPrice')), 'minPrice'],
        [Product.sequelize.fn('MAX', Product.sequelize.col('sellPrice')), 'maxPrice'],
        [Product.sequelize.fn('AVG', Product.sequelize.col('sellPrice')), 'avgPrice']
      ],
      where: { status: 'Active' },
      raw: true
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        priceStats
      }
    });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics'
    });
  }
});

// Search products
router.get('/search/autocomplete', authenticateToken, requireAdminOrCustomer, async (req, res) => {
  try {
    const { q = '' } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const products = await Product.findAll({
      where: {
        status: 'Active',
        [Op.or]: [
          { model: { [Op.iLike]: `%${q}%` } },
          { grade: { [Op.iLike]: `%${q}%` } },
          { color: { [Op.iLike]: `%${q}%` } },
          { capacity: { [Op.iLike]: `%${q}%` } }
        ]
      },
      attributes: ['id', 'model', 'grade', 'capacity', 'color', 'sellPrice', 'quantity'],
      limit: 10,
      order: [['model', 'ASC']]
    });

    res.json({
      success: true,
      data: products.map(product => ({
        ...product.toJSON(),
        finalPrice: product.getFinalPrice(),
        isAvailable: product.isAvailable()
      }))
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products'
    });
  }
});

// Get products by model (for product details page)
router.get('/model/:modelName', authenticateToken, requireAdminOrCustomer, async (req, res) => {
  try {
    const { modelName } = req.params;
    const { grade = '', color = '' } = req.query;

    const whereClause = {
      model: { [Op.iLike]: `%${modelName}%` },
      status: 'Active'
    };

    if (grade) {
      whereClause.grade = { [Op.iLike]: `%${grade}%` };
    }

    if (color) {
      whereClause.color = { [Op.iLike]: `%${color}%` };
    }

    const products = await Product.findAll({
      where: whereClause,
      order: [['grade', 'ASC'], ['capacity', 'ASC'], ['color', 'ASC']]
    });

    // Group products by grade and capacity
    const groupedProducts = products.reduce((acc, product) => {
      const key = `${product.grade}-${product.capacity}`;
      if (!acc[key]) {
        acc[key] = {
          grade: product.grade,
          capacity: product.capacity,
          variants: []
        };
      }
      acc[key].variants.push({
        ...product.toJSON(),
        finalPrice: product.getFinalPrice(),
        isAvailable: product.isAvailable()
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        model: modelName,
        groupedProducts: Object.values(groupedProducts)
      }
    });
  } catch (error) {
    console.error('Error fetching products by model:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by model'
    });
  }
});

module.exports = router; 