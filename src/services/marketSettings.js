const { Product, PriceHistory, MarketSettings } = require('../models');

// Default market settings
const DEFAULT_SETTINGS = {
  VE: {
    maxProfitCap: 1000,
    minProfitCap: 50,
    highMarginPercent: 35,
    lowMarginPercent: 15,
    marginCurveEnabled: true,
    curveStartPrice: 500,
    curveEndPrice: 1500,
    curveStartMargin: 35,
    curveEndMargin: 15,
    curveSteepness: 2.0,
    usShipping: 25,
    internationalShipping: 35,
    box: 5,
    cable: 3,
    charger: 8,
    commissionType: 'percentage',
    commissionValue: 5.0,
    kValue: 0.01,
    fValue: 5,
    capValue: 50
  },
  US: {
    maxProfitCap: 1500,
    minProfitCap: 75,
    highMarginPercent: 40,
    lowMarginPercent: 20,
    marginCurveEnabled: true,
    curveStartPrice: 600,
    curveEndPrice: 2000,
    curveStartMargin: 40,
    curveEndMargin: 20,
    curveSteepness: 1.8,
    usShipping: 20,
    box: 4,
    cable: 2,
    charger: 6,
    commissionType: 'percentage',
    commissionValue: 3.5,
    kValue: 0.015,
    fValue: 8,
    capValue: 75
  }
};

// Cache for market settings
let settingsCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get market settings with caching
 */
const getMarketSettings = async (market = 'VE') => {
  const now = Date.now();
  
  // Return cached settings if still valid
  if (settingsCache && settingsCache[market] && (now - lastCacheUpdate) < CACHE_DURATION) {
    console.log(`getMarketSettings - Using cached settings for ${market}:`, settingsCache[market]);
    return settingsCache[market];
  }
  
  try {
    // Fetch from database
    console.log(`getMarketSettings - Fetching from database for ${market}...`);
    const dbSettings = await MarketSettings.findOne({
      where: { market }
    });
    
    if (dbSettings) {
      let parsedSettings = dbSettings.settings;
      if (typeof parsedSettings === 'string') {
        try {
          parsedSettings = JSON.parse(parsedSettings);
        } catch (e) {
          console.error('Error parsing settings JSON from database:', e);
          parsedSettings = DEFAULT_SETTINGS[market];
        }
      }
      console.log(`getMarketSettings - Found database settings for ${market}:`, parsedSettings);
      if (!settingsCache) settingsCache = {};
      settingsCache[market] = parsedSettings;
      lastCacheUpdate = now;
      return parsedSettings;
    } else {
      console.log(`getMarketSettings - No database settings found for ${market}, creating default settings...`);
      
      // Auto-create default settings in database if none exist
      try {
        await saveMarketSettings(market, DEFAULT_SETTINGS[market]);
        console.log(`getMarketSettings - Created default settings for ${market} in database`);
        
        // Cache the default settings
        if (!settingsCache) settingsCache = {};
        settingsCache[market] = DEFAULT_SETTINGS[market];
        lastCacheUpdate = now;
        return DEFAULT_SETTINGS[market];
      } catch (saveError) {
        console.error('Error creating default settings:', saveError);
        // Fall back to in-memory defaults
        console.log(`getMarketSettings - Using in-memory default settings for ${market}:`, DEFAULT_SETTINGS[market]);
        if (!settingsCache) settingsCache = {};
        settingsCache[market] = DEFAULT_SETTINGS[market];
        lastCacheUpdate = now;
        return DEFAULT_SETTINGS[market];
      }
    }
  } catch (error) {
    console.error('Error loading market settings:', error);
    console.log(`getMarketSettings - Using fallback default settings for ${market}:`, DEFAULT_SETTINGS[market]);
    if (!settingsCache) settingsCache = {};
    settingsCache[market] = DEFAULT_SETTINGS[market];
    lastCacheUpdate = now;
    return DEFAULT_SETTINGS[market];
  }
};

/**
 * Calculate margin using curve logic
 */
const calculateMarginCurve = async (market, cost) => {
  const settings = await getMarketSettings(market);
  
  if (!settings.marginCurveEnabled) {
    // Use high margin for low costs, low margin for high costs
    const highMargin = settings.highMarginPercent || settings.curveStartMargin || 35;
    const lowMargin = settings.lowMarginPercent || settings.curveEndMargin || 15;
    return cost <= settings.curveStartPrice ? highMargin : lowMargin;
  }
  
  // Get margin values from settings (support both old and new field names)
  const highMargin = settings.highMarginPercent || settings.curveStartMargin || 35;
  const lowMargin = settings.lowMarginPercent || settings.curveEndMargin || 15;
  
  if (cost <= settings.curveStartPrice) {
    return highMargin;
  }
  if (cost >= settings.curveEndPrice) {
    return lowMargin;
  }
  
  // Calculate normalized position (0 to 1) within the curve range
  const priceRange = settings.curveEndPrice - settings.curveStartPrice;
  const normalizedPrice = (cost - settings.curveStartPrice) / priceRange;
  
  // Apply sigmoid curve transformation
  // Transform 0-1 range to -6 to 6 for sigmoid (covers most of the curve)
  const sigmoidInput = (normalizedPrice - 0.5) * 12;
  
  // Apply steepness factor
  const adjustedInput = sigmoidInput * settings.curveSteepness;
  
  // Calculate sigmoid: 1 / (1 + e^(-x))
  const sigmoidValue = 1 / (1 + Math.exp(-adjustedInput));
  
  // Map sigmoid output (0-1) to margin range (high to low)
  const marginRange = highMargin - lowMargin;
  const margin = highMargin - (marginRange * sigmoidValue);
  
  console.log(`calculateMarginCurve - cost: ${cost}, normalizedPrice: ${normalizedPrice.toFixed(3)}, sigmoidValue: ${sigmoidValue.toFixed(3)}, margin: ${margin.toFixed(2)}%`);
  
  return margin;
};

/**
 * Calculate sell price with market settings
 */
const calculateSellPrice = async (cost, market = 'VE') => {
  try {
    const settings = await getMarketSettings(market);
    const marginPercent = await calculateMarginCurve(market, cost);
    
    console.log(`calculateSellPrice - cost: ${cost}, market: ${market}, marginPercent: ${marginPercent}%`);
    
    if (marginPercent === undefined || marginPercent === null || isNaN(marginPercent)) {
      console.error(`Invalid marginPercent: ${marginPercent} for cost: ${cost}, market: ${market}`);
      return cost + (settings.minProfitCap || 50); // Fallback
    }
    
    // Calculate profit based on margin percentage
    let profit = cost * (marginPercent / 100);
    
    // Apply profit caps
    const maxProfit = settings.maxProfitCap;
    const minProfit = settings.minProfitCap;
    
    console.log(`calculateSellPrice - initial profit: ${profit}, maxProfit: ${maxProfit}, minProfit: ${minProfit}`);
    
    if (profit > maxProfit) {
      profit = maxProfit;
      console.log(`calculateSellPrice - capped profit at maxProfit: ${profit}`);
    } else if (profit < minProfit) {
      profit = minProfit;
      console.log(`calculateSellPrice - capped profit at minProfit: ${profit}`);
    }
    
    // Calculate sell price: cost + profit (NO commission included)
    const sellPrice = cost + profit;
    
    // Verify margin calculation: margin% = (profit / cost) * 100
    const calculatedMargin = (profit / cost) * 100;
    
    console.log(`calculateSellPrice - final: cost: ${cost}, profit: ${profit}, sellPrice: ${sellPrice}, margin: ${calculatedMargin}%`);
    
    const result = Math.round(sellPrice);
    console.log(`calculateSellPrice - final result: ${result} (sellPrice WITHOUT commission)`);
    return result;
  } catch (error) {
    console.error('Error in calculateSellPrice:', error);
    return cost + 50; // Fallback
  }
};

/**
 * Calculate commission
 */
const calculateCommission = async (price, market = 'VE') => {
  const settings = await getMarketSettings(market);
  
  if (settings.commissionType === 'percentage') {
    return (price * settings.commissionValue) / 100;
  } else {
    return settings.commissionValue;
  }
};

/**
 * Recalculate all product prices based on current market settings
 */
const recalculateAllPrices = async () => {
  try {
    clearSettingsCache(); // Always use latest settings from DB
    console.log('Starting price recalculation for all products...');
    
    // Find all products regardless of status
    const products = await Product.findAll();
    console.log(`Found ${products.length} products in database`);
    
    let updatedCount = 0;
    let priceHistoryCount = 0;
    
    for (const product of products) {
      const settings = await getMarketSettings(product.market);
      const basePrice = parseFloat(product.basePrice) || 0;
      const shippingCost = settings.usShipping || 0;
      const boxCost = settings.box || 0;
      const cableCost = settings.cable || 0;
      const chargerCost = settings.charger || 0;
      const totalCost = basePrice + shippingCost + boxCost + cableCost + chargerCost;
      const newSellPrice = await calculateSellPrice(totalCost, product.market);
      
      // Calculate profit and margin correctly
      const profitUSD = newSellPrice - totalCost;
      const margin = (profitUSD / totalCost) * 100; // margin% = (profit / totalCost) * 100
      const commission = await calculateCommission(newSellPrice, product.market);
      
      const oldPrice = parseFloat(product.sellPrice);
      
      console.log(`Processing product: ${product.model} ${product.grade} ${product.capacity} ${product.color} (${product.market})`);
      console.log(`  basePrice: ${basePrice}, shippingCost: ${shippingCost}, boxCost: ${boxCost}, cableCost: ${cableCost}, chargerCost: ${chargerCost}`);
      console.log(`  totalCost: ${totalCost}, oldSellPrice: ${oldPrice}, newSellPrice: ${newSellPrice}, margin: ${margin}, profitUSD: ${profitUSD}`);
      
      // Record price history if price changed
      if (Math.abs(newSellPrice - oldPrice) > 0.01) {
        await PriceHistory.create({
          productId: product.id,
          oldPrice: oldPrice,
          newPrice: newSellPrice,
          changeType: 'automatic',
          changeReason: 'Market settings update',
          marketSettings: settings
        });
        priceHistoryCount++;
      }
      
      // Always update product fields
      await product.update({
        shippingCost: shippingCost,
        additionalCost: boxCost + cableCost + chargerCost,
        totalCost: totalCost,
        sellPrice: newSellPrice,
        margin: margin,
        profitUSD: profitUSD,
        commission: commission,
        priceLastUpdated: new Date(),
        marketSettingsSnapshot: settings
      });
      updatedCount++;
    }
    
    console.log(`Price recalculation complete: ${updatedCount} products updated, ${priceHistoryCount} price history records created`);
    return { updatedCount, priceHistoryCount };
  } catch (error) {
    console.error('Error recalculating prices:', error);
    throw error;
  }
};

/**
 * Update product with new inventory data and recalculate prices
 */
const updateProductInventory = async (productData, market = 'VE') => {
  try {
    const settings = await getMarketSettings(market);
    
    // Debug: Log the actual settings being used
    console.log(`updateProductInventory - Market: ${market}, Settings loaded:`, {
      usShipping: settings.usShipping,
      box: settings.box,
      cable: settings.cable,
      charger: settings.charger,
      maxProfitCap: settings.maxProfitCap,
      minProfitCap: settings.minProfitCap,
      highMarginPercent: settings.highMarginPercent,
      lowMarginPercent: settings.lowMarginPercent
    });
    
    // Calculate costs
    const basePrice = parseFloat(productData.basePrice) || 0;
    console.log(`updateProductInventory - productData:`, productData);
    console.log(`updateProductInventory - basePrice:`, basePrice);
    
    const shippingCost = settings.usShipping || 0;
    const boxCost = settings.box || 0;
    const cableCost = settings.cable || 0;
    const chargerCost = settings.charger || 0;
    const totalCost = basePrice + shippingCost + boxCost + cableCost + chargerCost;
    console.log(`updateProductInventory - totalCost:`, totalCost);
    
    // Calculate new sell price
    const newSellPrice = await calculateSellPrice(totalCost, market);
    console.log(`updateProductInventory - newSellPrice:`, newSellPrice);
    
    // Calculate profit and margin correctly
    const profitUSD = newSellPrice - totalCost;
    const margin = (profitUSD / totalCost) * 100; // margin% = (profit / totalCost) * 100
    const commission = await calculateCommission(newSellPrice, market);
    
    console.log(`updateProductInventory - profitUSD: ${profitUSD}, margin: ${margin}%, commission: ${commission}`);
    
    // Find existing product
    const existingProduct = await Product.findOne({
      where: {
        model: productData.model,
        grade: productData.grade,
        capacity: productData.capacity,
        color: productData.color,
        market: market
      }
    });
    
    if (existingProduct) {
      const oldPrice = parseFloat(existingProduct.sellPrice);
      
      // Record price history if price changed
      if (Math.abs(newSellPrice - oldPrice) > 0.01) {
        await PriceHistory.create({
          productId: existingProduct.id,
          oldPrice: oldPrice,
          newPrice: newSellPrice,
          changeType: 'import',
          changeReason: 'Inventory update from scraper',
          marketSettings: settings
        });
      }
      
      // Update product
      await existingProduct.update({
        quantity: productData.quantity,
        basePrice: basePrice,
        shippingCost: shippingCost,
        additionalCost: boxCost + cableCost + chargerCost,
        totalCost: totalCost,
        sellPrice: newSellPrice,
        margin: margin,
        profitUSD: profitUSD,
        commission: commission,
        inventoryLastUpdated: new Date(),
        priceLastUpdated: new Date(),
        marketSettingsSnapshot: settings
      });
    } else {
      // Create new product
      await Product.create({
        model: productData.model,
        grade: productData.grade,
        capacity: productData.capacity,
        color: productData.color,
        quantity: productData.quantity,
        basePrice: basePrice,
        shippingCost: shippingCost,
        additionalCost: boxCost + cableCost + chargerCost,
        totalCost: totalCost,
        sellPrice: newSellPrice,
        margin: margin,
        profitUSD: profitUSD,
        commission: commission,
        market: market,
        status: 'Active',
        inventoryLastUpdated: new Date(),
        priceLastUpdated: new Date(),
        marketSettingsSnapshot: settings
      });
    }
  } catch (error) {
    console.error('Error updating product inventory:', error);
    throw error;
  }
};

/**
 * Ensure database has settings for all markets
 */
const ensureDatabaseSettings = async () => {
  try {
    console.log('Ensuring database has settings for all markets...');
    
    for (const market of ['US', 'VE']) {
      const existingSettings = await MarketSettings.findOne({
        where: { market }
      });
      
      if (!existingSettings) {
        console.log(`Creating default settings for ${market} in database...`);
        await saveMarketSettings(market, DEFAULT_SETTINGS[market]);
      }
    }
    
    console.log('Database settings check complete');
  } catch (error) {
    console.error('Error ensuring database settings:', error);
  }
};

/**
 * Save market settings to database
 */
const saveMarketSettings = async (market, settings) => {
  try {
    console.log('Saving market settings:', { market, settings });
    
    const [dbSettings, created] = await MarketSettings.findOrCreate({
      where: { market },
      defaults: { settings }
    });
    
    console.log('Database operation result:', { created, dbSettings: dbSettings ? dbSettings.toJSON() : null });
    
    if (!created) {
      await dbSettings.update({ settings });
      console.log('Updated existing settings');
    } else {
      console.log('Created new settings');
    }
    
    // Clear cache to force refresh
    clearSettingsCache();
    
    return dbSettings;
  } catch (error) {
    console.error('Error saving market settings:', error);
    throw error;
  }
};

/**
 * Clear settings cache to force refresh
 */
const clearSettingsCache = () => {
  console.log('clearSettingsCache - Clearing all cached settings');
  settingsCache = null;
  lastCacheUpdate = 0;
  console.log('clearSettingsCache - Cache cleared, next getMarketSettings will fetch from database');
};

module.exports = {
  getMarketSettings,
  saveMarketSettings,
  calculateMarginCurve,
  calculateSellPrice,
  calculateCommission,
  recalculateAllPrices,
  updateProductInventory,
  clearSettingsCache,
  ensureDatabaseSettings,
  DEFAULT_SETTINGS
}; 