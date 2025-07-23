const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const { scrapeAndImport } = require('./src/scraper/peach.js');
const { sequelize, testConnection, User, Product, Cart, Order, OrderItem, Payment, OrderStatusHistory } = require('./src/models');
const { authenticateToken, requireAdmin, requireCustomer, generateToken } = require('./src/middleware/auth');
const ordersRouter = require('./src/routes/orders');
const productsRouter = require('./src/routes/products');
const cartRouter = require('./src/routes/cart');
const settingsRouter = require('./src/routes/settings');
const invoicesRouter = require('./src/routes/invoices');
const financingRouter = require('./src/routes/financing');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Add at the top of the file (after imports)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Stack trace:', reason.stack);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  console.error('Stack trace:', err.stack);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully.');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully.');
  process.exit(0);
});

// Add this to catch any process.exit calls
const originalExit = process.exit;
process.exit = function(code) {
  console.error('process.exit called with code:', code);
  console.error('Stack trace:', new Error().stack);
  return originalExit.call(this, code);
};

// Initialize database
const initializeDatabase = async () => {
  console.log('initializeDatabase: START');
  try {
    await testConnection();
    await sequelize.sync({ force: false }); // Use force: false to avoid backup table creation
    console.log('Database synchronized successfully');
    
    // Ensure market settings are available in database
    const { ensureDatabaseSettings } = require('./src/services/marketSettings');
    await ensureDatabaseSettings();
    
    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ where: { email: 'admin@albilogistics.com' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Mamapelota123@', 10);
      await User.create({
        email: 'admin@albilogistics.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        company: 'Albi Logistics',
        isActive: true
      });
      console.log('Admin user created');
    }
    console.log('initializeDatabase: END');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// In-memory data store (legacy - now using database)
let productsData = [];

// POST /api/sync/manual - Manual sync endpoint
app.post('/api/sync/manual', async (req, res) => {
  try {
    console.log('Starting manual sync...');
    
    const result = await scrapeAndImport();
    
    if (result.success) {
      console.log(`Sync completed successfully. Imported ${result.importResult.length} products.`);
      
      res.json({
        success: true,
        message: `Sync completed successfully. Imported ${result.importResult.length} products.`,
        data: result.importResult
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Sync failed'
      });
    }
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/sync - Alternative sync endpoint
app.post('/api/sync', async (req, res) => {
  try {
    console.log('Starting sync...');
    
    const result = await scrapeAndImport();
    
    if (result.success) {
      console.log(`Sync completed successfully. Imported ${result.importResult.length} products.`);
      
      res.json({
        success: true,
        message: `Sync completed successfully. Imported ${result.importResult.length} products.`,
        data: result.importResult
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Sync failed'
      });
    }
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/costs - Get costs data (for the Costs tab)
app.get('/api/costs', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { status: 'Active' },
      order: [['model', 'ASC']]
    });
    
    // Import the marketSettings service
    const { getMarketSettings } = require('./src/services/marketSettings');
    
    // Calculate customer prices using real market settings
    const productsWithCustomerPrices = await Promise.all(products.map(async (product) => {
      const productData = product.toJSON();
      const market = productData.market || 'VE';
      
      // Get real market settings from database
      const marketSettings = await getMarketSettings(market);
      
      // Use the pre-calculated values from the database
      const totalCost = parseFloat(productData.totalCost) || 0;
      const sellPrice = parseFloat(productData.sellPrice) || 0; // This is WITHOUT commission
      const margin = parseFloat(productData.margin) || 0;
      
      // Calculate commission based on sellPrice (not customer price)
      let commission = 0;
      if (marketSettings.commissionType === 'percentage') {
        commission = (sellPrice * marketSettings.commissionValue) / 100;
      } else if (marketSettings.commissionType === 'flat') {
        commission = marketSettings.commissionValue;
      }
      
      // Customer price = sellPrice + commission
      const customerPrice = sellPrice + commission;
      
      console.log(`Costs endpoint - ${productData.model} ${productData.grade} ${productData.capacity} (${market}):`);
      console.log(`  totalCost: ${totalCost}, sellPrice: ${sellPrice}, commission: ${commission}, customerPrice: ${customerPrice}`);
      
      return {
        ...productData,
        finalPrice: customerPrice, // This is the customer price (sellPrice + commission)
        customerPrice: customerPrice, // Explicit customer price
        sellPrice: sellPrice, // This is WITHOUT commission
        totalCost: totalCost,
        margin: margin,
        marginPercent: margin > 0 ? margin.toFixed(2) : '0.00',
        commission: commission,
        isAvailable: product.isAvailable(),
        inventoryLastUpdated: productData.inventoryLastUpdated ? new Date(productData.inventoryLastUpdated).toLocaleString() : 'Never',
        priceLastUpdated: productData.priceLastUpdated ? new Date(productData.priceLastUpdated).toLocaleString() : 'Never'
      };
    }));
    
    res.json({
      success: true,
      data: productsWithCustomerPrices
    });
  } catch (error) {
    console.error('Error fetching costs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch costs data'
    });
  }
});

// Import the real marketSettings service instead of using hardcoded defaults
const { getMarketSettings: getRealMarketSettings, calculateCommission: calculateRealCommission, calculateSellPrice: calculateRealSellPrice } = require('./src/services/marketSettings');

// GET /api/admin-prices - Get admin dashboard's exact price data (for client portal mirroring)
app.get('/api/admin-prices', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { status: 'Active' },
      order: [['model', 'ASC']]
    });
    
    const adminPrices = await Promise.all(products.map(async (product) => {
      const productData = product.toJSON();
      const market = productData.market || 'VE';
      const marketSettings = await getRealMarketSettings(market);
      
      // Use basePrice for cost
      const cost = parseFloat(productData.basePrice) || 0;
      // Add box and cable costs (mirroring admin logic)
      const totalCost = cost + (marketSettings.box || 0) + (marketSettings.cable || 0);
      
      // Use overridePrice if isOverride is true and overridePrice is not null
      let sellPrice;
      let isOverride = false;
      let overridePrice = null;
      if (productData.isOverride && productData.overridePrice != null) {
        sellPrice = parseFloat(productData.overridePrice);
        isOverride = true;
        overridePrice = parseFloat(productData.overridePrice);
      } else {
        sellPrice = await calculateRealSellPrice(totalCost, market);
      }
      
      // Calculate commission
      const commission = await calculateRealCommission(sellPrice, market);
      // Customer price = sellPrice + commission
      const customerPrice = sellPrice + commission;
      // Margin and profit - use sellPrice for profit calculation, not customerPrice
      const profit = sellPrice - totalCost; // profit = sellPrice - totalCost
      const margin = totalCost > 0 ? ((profit / totalCost) * 100) : 0; // margin% = (profit / totalCost) * 100
      
      return {
        id: productData.id,
        model: productData.model,
        grade: productData.grade,
        capacity: productData.capacity,
        color: productData.color,
        quantity: productData.quantity,
        basePrice: cost,
        totalCost: totalCost,
        sellPrice: sellPrice,
        customerPrice: customerPrice,
        commission: commission,
        margin: margin,
        profit: profit,
        market: market,
        isOverride: isOverride,
        overridePrice: overridePrice,
        lastUpdated: productData.updatedAt
      };
    }));
    
    res.json({
      success: true,
      data: adminPrices
    });
  } catch (error) {
    console.error('Error fetching admin prices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin prices data'
    });
  }
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, company, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with email verification
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'customer',
      company,
      phone,
      address,
      isActive: true, // Active immediately
      emailVerified: false // Email verification pending
    });

    res.json({
      success: true,
      message: 'Account created successfully. Please check your email for verification.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          company: user.company,
          isActive: user.isActive,
          emailVerified: user.emailVerified
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          company: user.company
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Protected route example
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        company: req.user.company,
        isActive: req.user.isActive,
        emailVerified: req.user.emailVerified
      }
    }
  });
});

// Email verification endpoint
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, token } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // For now, we'll just mark the email as verified
    // In a real implementation, you'd verify the token
    await user.update({
      emailVerified: true
    });

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
});

// API routes
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/financing', financingRouter);

// Serve uploaded files (PDFs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({ 
      status: "unhealthy", 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
app.get("/api/health", async (req, res) => {
  try {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({ 
      status: "unhealthy", 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
app.get("/api/health", async (req, res) => {
  try {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({ 
      status: "unhealthy", 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
app.get("/api/health", async (req, res) => {
  try {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({ 
      status: "unhealthy", 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
app.get("/api/health", async (req, res) => {
  try {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({ 
      status: "unhealthy", 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
app.get("/api/health", async (req, res) => {
  try {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({ 
      status: "unhealthy", 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});
});

// Test endpoint without authentication
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Sync endpoint: http://localhost:${PORT}/api/sync/manual`);
    console.log(`Auth endpoints: http://localhost:${PORT}/api/auth/register, http://localhost:${PORT}/api/auth/login`);
    console.log('AFTER app.listen: Server should be alive and listening!');
  });
}); // Start server immediately
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Health check: http://localhost:" + PORT + "/api/health");
  console.log("Root endpoint: http://localhost:" + PORT + "/");
  console.log("AFTER app.listen: Server should be alive and listening!");
});

// Initialize database in background
initializeDatabase().then(() => {
  console.log("Database initialized successfully");
}).catch((error) => {
  console.error("Database initialization failed:", error);
  console.log("Server is still running without database");
});
