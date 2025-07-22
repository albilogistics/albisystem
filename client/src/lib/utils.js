import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}

// Market settings utility functions
export const getMarketSettings = (market = 'VE') => {
  try {
    const savedSettings = localStorage.getItem('marketSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return settings[market] || getDefaultSettings(market);
    }
  } catch (error) {
    console.error('Error loading market settings:', error);
  }
  return getDefaultSettings(market);
};

export const getDefaultSettings = (market) => {
  const defaults = {
    VE: {
      // Profit Caps
      maxProfitCap: 1000,
      minProfitCap: 50,
      
      // Margin Settings
      highMarginPercent: 35,
      lowMarginPercent: 15,
      
      // Margin Curve Settings
      marginCurveEnabled: true,
      curveStartPrice: 500,
      curveEndPrice: 1500,
      curveStartMargin: 35,
      curveEndMargin: 15,
      curveSteepness: 2.0,
      
      // Shipping Costs
      usShipping: 25,
      internationalShipping: 35,
      box: 5,
      cable: 3,
      charger: 8,
      
      // Commission Settings
      commissionType: 'percentage',
      commissionValue: 5.0,
      
      // Additional Costs
      kValue: 0.01,
      fValue: 5,
      capValue: 50
    },
    US: {
      // Profit Caps
      maxProfitCap: 1500,
      minProfitCap: 75,
      
      // Margin Settings
      highMarginPercent: 40,
      lowMarginPercent: 20,
      
      // Margin Curve Settings
      marginCurveEnabled: true,
      curveStartPrice: 600,
      curveEndPrice: 2000,
      curveStartMargin: 40,
      curveEndMargin: 20,
      curveSteepness: 1.8,
      
      // Shipping Costs
      usShipping: 20,
      box: 4,
      cable: 2,
      charger: 6,
      
      // Commission Settings
      commissionType: 'percentage',
      commissionValue: 3.5,
      
      // Additional Costs
      kValue: 0.015,
      fValue: 8,
      capValue: 75
    }
  };
  return defaults[market] || defaults.VE;
};

export const calculateCommission = (price, marketSettings) => {
  if (marketSettings.commissionType === 'percentage') {
    return (price * marketSettings.commissionValue) / 100;
  } else {
    return marketSettings.commissionValue;
  }
};

export const calculateMarginCurve = (market, cost) => {
  const settings = getMarketSettings(market);
  
  if (!settings.marginCurveEnabled) {
    return cost <= settings.curveStartPrice ? settings.curveStartMargin : settings.curveEndMargin;
  }
  
  if (cost <= settings.curveStartPrice) {
    return settings.curveStartMargin;
  }
  if (cost >= settings.curveEndPrice) {
    return settings.curveEndMargin;
  }
  
  // Calculate margin using exponential decay curve
  const priceRange = settings.curveEndPrice - settings.curveStartPrice;
  const marginRange = settings.curveStartMargin - settings.curveEndMargin;
  const normalizedPrice = (cost - settings.curveStartPrice) / priceRange;
  
  // Exponential decay: higher cost = lower margin
  const curveFactor = Math.pow(normalizedPrice, settings.curveSteepness);
  const margin = settings.curveStartMargin - (marginRange * curveFactor);
  
  return margin;
};

export const calculateSellPrice = (cost, market) => {
  const settings = getMarketSettings(market);
  const marginPercent = calculateMarginCurve(market, cost);
  
  // Calculate base sell price with margin
  let sellPrice = cost * (1 + marginPercent / 100);
  
  // Apply profit cap constraints
  const profit = sellPrice - cost;
  const maxProfit = settings.maxProfitCap;
  const minProfit = settings.minProfitCap;
  
  if (profit > maxProfit) {
    sellPrice = cost + maxProfit;
  } else if (profit < minProfit) {
    sellPrice = cost + minProfit;
  }
  
  const finalPrice = Math.round(sellPrice);
  
  return finalPrice;
}; 