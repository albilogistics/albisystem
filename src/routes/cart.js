const express = require('express');
const { authenticateToken, requireCustomer } = require('../middleware/auth');
const { Cart, Product } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'model', 'grade', 'capacity', 'color', 'quantity', 'sellPrice', 'isOverride', 'overridePrice']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate totals
    let subtotal = 0;
    let totalItems = 0;
    const processedItems = [];

    for (const item of cartItems) {
      const product = item.product;
      if (!product) continue;

      const finalPrice = product.isOverride && product.overridePrice ? product.overridePrice : product.sellPrice;
      const itemTotal = finalPrice * item.quantity;
      
      subtotal += itemTotal;
      totalItems += item.quantity;

      processedItems.push({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
        product: {
          ...product.toJSON(),
          finalPrice: finalPrice,
          isAvailable: product.isAvailable()
        },
        itemTotal: itemTotal
      });
    }

    res.json({
      success: true,
      data: {
        items: processedItems,
        summary: {
          totalItems,
          subtotal: parseFloat(subtotal.toFixed(2)),
          estimatedTax: parseFloat((subtotal * 0.08).toFixed(2)), // 8% tax
          estimatedShipping: totalItems > 0 ? 25 : 0,
          total: parseFloat((subtotal + (subtotal * 0.08) + (totalItems > 0 ? 25 : 0)).toFixed(2))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
});

// Add item to cart
router.post('/add', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { productId, quantity = 1, notes = '' } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists and is available
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isAvailable()) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    if (quantity > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} units available`
      });
    }

    const finalPrice = product.getFinalPrice();

    // Check if item already exists in cart
    const existingItem = await Cart.findOne({
      where: { userId: req.user.id, productId }
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more units. Only ${product.quantity - existingItem.quantity} additional units available`
        });
      }

      await existingItem.update({
        quantity: newQuantity,
        price: finalPrice,
        notes: notes || existingItem.notes
      });

      res.json({
        success: true,
        message: 'Cart item updated',
        data: {
          id: existingItem.id,
          quantity: newQuantity,
          price: finalPrice
        }
      });
    } else {
      // Create new cart item
      const cartItem = await Cart.create({
        userId: req.user.id,
        productId,
        quantity,
        price: finalPrice,
        notes
      });

      res.status(201).json({
        success: true,
        message: 'Item added to cart',
        data: {
          id: cartItem.id,
          quantity,
          price: finalPrice
        }
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
});

// Update cart item quantity
router.put('/update/:itemId', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, notes } = req.body;

    const cartItem = await Cart.findOne({
      where: { id: itemId, userId: req.user.id },
      include: [{ model: Product, as: 'product' }]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const product = cartItem.product;
    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (quantity > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} units available`
      });
    }

    const updateData = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (notes !== undefined) updateData.notes = notes;

    await cartItem.update(updateData);

    res.json({
      success: true,
      message: 'Cart item updated',
      data: {
        id: cartItem.id,
        quantity: cartItem.quantity,
        notes: cartItem.notes
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item'
    });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cartItem = await Cart.findOne({
      where: { id: itemId, userId: req.user.id }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await cartItem.destroy();

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove cart item'
    });
  }
});

// Clear entire cart
router.delete('/clear', authenticateToken, requireCustomer, async (req, res) => {
  try {
    await Cart.destroy({
      where: { userId: req.user.id }
    });

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

// Get cart summary (for header cart icon)
router.get('/summary', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['sellPrice', 'isOverride', 'overridePrice']
        }
      ]
    });

    let totalItems = 0;
    let subtotal = 0;

    for (const item of cartItems) {
      const product = item.product;
      if (!product) continue;

      const finalPrice = product.isOverride && product.overridePrice ? product.overridePrice : product.sellPrice;
      subtotal += finalPrice * item.quantity;
      totalItems += item.quantity;
    }

    res.json({
      success: true,
      data: {
        totalItems,
        subtotal: parseFloat(subtotal.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error fetching cart summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart summary'
    });
  }
});

module.exports = router; 