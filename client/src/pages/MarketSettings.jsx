import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  CreditCard,
  Percent,
  Calculator,
  Globe,
  Shield,
  Bell,
  Palette,
  Database,
  Check,
  X,
  AlertCircle,
  Info,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from 'lucide-react';

const MarketSettings = () => {
  const [activeTab, setActiveTab] = useState('pricing');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });
  
  const [settings, setSettings] = useState({
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
      commissionType: 'percentage', // 'percentage' or 'flat'
      commissionValue: 5.0, // 5% or $5 flat
      
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
  });

  const tabs = [
    { id: 'pricing', label: 'Pricing & Margins', icon: DollarSign },
    { id: 'shipping', label: 'Shipping & Costs', icon: Truck },
    { id: 'commission', label: 'Commission', icon: Percent },
    { id: 'general', label: 'General', icon: Settings }
  ];

  const handleSettingChange = (market, key, value) => {
    setSettings(prev => ({
      ...prev,
      [market]: {
        ...prev[market],
        [key]: value
      }
    }));
  };

  const calculateMarginCurve = (market, price) => {
    const curve = settings[market];
    if (!curve.marginCurveEnabled) {
      return price <= curve.curveStartPrice ? curve.curveStartMargin : curve.curveEndMargin;
    }
    
    if (price <= curve.curveStartPrice) {
      return curve.curveStartMargin;
    }
    if (price >= curve.curveEndPrice) {
      return curve.curveEndMargin;
    }
    
    // Calculate margin using exponential decay curve
    const priceRange = curve.curveEndPrice - curve.curveStartPrice;
    const marginRange = curve.curveStartMargin - curve.curveEndMargin;
    const normalizedPrice = (price - curve.curveStartPrice) / priceRange;
    
    // Exponential decay: higher price = lower margin
    const curveFactor = Math.pow(normalizedPrice, curve.curveSteepness);
    return curve.curveStartMargin - (marginRange * curveFactor);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus({ type: '', message: '' });
    
    try {
      // Save settings for both markets via API
      const markets = ['VE', 'US'];
      for (const market of markets) {
        const payload = {
          market: market,
          settings: settings[market]
        };
        console.log(`[MarketSettings] Saving settings for ${market}:`, payload);
        await fetch('/api/settings/market-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(payload)
        });
      }
      
      // Save to localStorage for frontend consistency
      localStorage.setItem('marketSettings', JSON.stringify(settings));
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('marketSettingsChanged'));
      window.dispatchEvent(new Event('refreshCostsData'));
      
      setSaveStatus({ 
        type: 'success', 
        message: 'Settings saved successfully for both markets!' 
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSaveStatus({ type: '', message: '' });
      }, 5000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus({ 
        type: 'error', 
        message: `Failed to save settings: ${error.message}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      const defaultSettings = {
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
      setSettings(defaultSettings);
      setSaveStatus({ 
        type: 'info', 
        message: 'Settings reset to default values.' 
      });
    }
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('marketSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  const renderStatusMessage = () => {
    if (!saveStatus.message) return null;
    
    const statusColors = {
      success: 'text-green-400 bg-green-400/10 border-green-400/20',
      error: 'text-red-400 bg-red-400/10 border-red-400/20',
      info: 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    };
    
    return (
      <div className={`p-4 rounded-lg border ${statusColors[saveStatus.type]} flex items-center space-x-2`}>
        {saveStatus.type === 'success' && <Check className="w-4 h-4" />}
        {saveStatus.type === 'error' && <AlertCircle className="w-4 h-4" />}
        {saveStatus.type === 'info' && <Info className="w-4 h-4" />}
        <span>{saveStatus.message}</span>
      </div>
    );
  };

  const renderMarginCurvePreview = (market) => {
    const curve = settings[market];
    const prices = [curve.curveStartPrice, curve.curveStartPrice + 200, curve.curveStartPrice + 400, curve.curveEndPrice];
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Price Range</span>
          <span className="text-white">${curve.curveStartPrice} - ${curve.curveEndPrice}</span>
        </div>
        <div className="space-y-2">
          {prices.map((price, index) => {
            const margin = calculateMarginCurve(market, price);
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg">
                <span className="text-zinc-300 text-sm">${price}</span>
                <span className="text-green-400 text-sm font-medium">{margin.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-grow bg-black overflow-y-auto">
      {/* Premium Header */}
      <div className="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-zinc-800/50 bg-black sticky top-0 z-30">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Market Settings</h1>
              <p className="text-zinc-400 text-sm">Configure pricing, margins, shipping, and commission settings</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleReset}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="btn-premium flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sm:p-7 p-4 space-y-6">
        {renderStatusMessage()}

        {/* Tab Navigation */}
        <div className="premium-card p-2">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              {/* Venezuela Market */}
              <div className="premium-card p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Venezuela Market</h3>
                    <p className="text-zinc-400 text-sm">Pricing and margin settings for VE market</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Max Profit Cap ($)</label>
                    <input
                      type="number"
                      value={settings.VE.maxProfitCap}
                      onChange={(e) => handleSettingChange('VE', 'maxProfitCap', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Min Profit Cap ($)</label>
                    <input
                      type="number"
                      value={settings.VE.minProfitCap}
                      onChange={(e) => handleSettingChange('VE', 'minProfitCap', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">High Margin %</label>
                    <input
                      type="number"
                      value={settings.VE.highMarginPercent}
                      onChange={(e) => handleSettingChange('VE', 'highMarginPercent', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      max="100"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Low Margin %</label>
                    <input
                      type="number"
                      value={settings.VE.lowMarginPercent}
                      onChange={(e) => handleSettingChange('VE', 'lowMarginPercent', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      max="100"
                      step="0.5"
                    />
                  </div>
                </div>

                {/* Margin Curve Settings */}
                <div className="mt-8 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingDownIcon className="w-5 h-5 text-blue-400" />
                    <h4 className="text-white font-medium">Margin Curve Control</h4>
                  </div>
                  <p className="text-zinc-400 text-sm mb-4">
                    Automatically reduce margins for higher-priced items to remain competitive
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300 text-sm">Enable Margin Curve</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.VE.marginCurveEnabled}
                          onChange={(e) => handleSettingChange('VE', 'marginCurveEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Curve Start Price ($)</label>
                      <input
                        type="number"
                        value={settings.VE.curveStartPrice}
                        onChange={(e) => handleSettingChange('VE', 'curveStartPrice', parseFloat(e.target.value) || 0)}
                        className="input-premium w-full"
                        min="0"
                        step="50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Curve End Price ($)</label>
                      <input
                        type="number"
                        value={settings.VE.curveEndPrice}
                        onChange={(e) => handleSettingChange('VE', 'curveEndPrice', parseFloat(e.target.value) || 0)}
                        className="input-premium w-full"
                        min="0"
                        step="50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Curve Start Margin (%)</label>
                      <input
                        type="number"
                        value={settings.VE.curveStartMargin}
                        onChange={(e) => handleSettingChange('VE', 'curveStartMargin', parseFloat(e.target.value) || 0)}
                        className="input-premium w-full"
                        min="0"
                        max="100"
                        step="0.5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Curve End Margin (%)</label>
                      <input
                        type="number"
                        value={settings.VE.curveEndMargin}
                        onChange={(e) => handleSettingChange('VE', 'curveEndMargin', parseFloat(e.target.value) || 0)}
                        className="input-premium w-full"
                        min="0"
                        max="100"
                        step="0.5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Curve Steepness</label>
                      <input
                        type="number"
                        value={settings.VE.curveSteepness}
                        onChange={(e) => handleSettingChange('VE', 'curveSteepness', parseFloat(e.target.value) || 0)}
                        className="input-premium w-full"
                        min="0.5"
                        max="5"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Margin Curve Preview */}
                  <div className="mt-4 p-3 bg-zinc-900/50 rounded-lg">
                    <h5 className="text-white text-sm font-medium mb-2">Margin Curve Preview</h5>
                    {renderMarginCurvePreview('VE')}
                  </div>
                </div>
              </div>

              {/* US Market */}
              <div className="premium-card p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">US Market</h3>
                    <p className="text-zinc-400 text-sm">Pricing and margin settings for US market</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Max Profit Cap ($)</label>
                    <input
                      type="number"
                      value={settings.US.maxProfitCap}
                      onChange={(e) => handleSettingChange('US', 'maxProfitCap', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Min Profit Cap ($)</label>
                    <input
                      type="number"
                      value={settings.US.minProfitCap}
                      onChange={(e) => handleSettingChange('US', 'minProfitCap', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">High Margin %</label>
                    <input
                      type="number"
                      value={settings.US.highMarginPercent}
                      onChange={(e) => handleSettingChange('US', 'highMarginPercent', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      max="100"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Low Margin %</label>
                    <input
                      type="number"
                      value={settings.US.lowMarginPercent}
                      onChange={(e) => handleSettingChange('US', 'lowMarginPercent', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      max="100"
                      step="0.5"
                    />
                  </div>
                </div>

                {/* Margin Curve Settings for US */}
                <div className="mt-8 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingDownIcon className="w-5 h-5 text-blue-400" />
                    <h4 className="text-white font-medium">Margin Curve Control</h4>
                  </div>
                  <p className="text-zinc-400 text-sm mb-4">
                    Automatically reduce margins for higher-priced items to remain competitive
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300 text-sm">Enable Margin Curve</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.US.marginCurveEnabled}
                          onChange={(e) => handleSettingChange('US', 'marginCurveEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Curve Start Price ($)</label>
                      <input
                        type="number"
                        value={settings.US.curveStartPrice}
                        onChange={(e) => handleSettingChange('US', 'curveStartPrice', parseFloat(e.target.value) || 0)}
                        className="input-premium w-full"
                        min="0"
                        step="50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Curve End Price ($)</label>
                      <input
                        type="number"
                        value={settings.US.curveEndPrice}
                        onChange={(e) => handleSettingChange('US', 'curveEndPrice', parseFloat(e.target.value) || 0)}
                        className="input-premium w-full"
                        min="0"
                        step="50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Curve Start Margin (%)</label>
                      <input
                        type="number"
                        value={settings.US.curveStartMargin}
                        onChange={(e) => handleSettingChange('US', 'curveStartMargin', parseFloat(e.target.value) || 0)}
                        className="input-premium w-full"
                        min="0"
                        max="100"
                        step="0.5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Curve End Margin (%)</label>
                      <input
                        type="number"
                        value={settings.US.curveEndMargin}
                        onChange={(e) => handleSettingChange('US', 'curveEndMargin', parseFloat(e.target.value) || 0)}
                        className="input-premium w-full"
                        min="0"
                        max="100"
                        step="0.5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Curve Steepness</label>
                      <input
                        type="number"
                        value={settings.US.curveSteepness}
                        onChange={(e) => handleSettingChange('US', 'curveSteepness', parseFloat(e.target.value) || 0)}
                        className="input-premium w-full"
                        min="0.5"
                        max="5"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Margin Curve Preview */}
                  <div className="mt-4 p-3 bg-zinc-900/50 rounded-lg">
                    <h5 className="text-white text-sm font-medium mb-2">Margin Curve Preview</h5>
                    {renderMarginCurvePreview('US')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6">
              {/* Venezuela Shipping */}
              <div className="premium-card p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Venezuela Shipping Costs</h3>
                    <p className="text-zinc-400 text-sm">Shipping and packaging costs for VE market</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">US Shipping ($)</label>
                    <input
                      type="number"
                      value={settings.VE.usShipping}
                      onChange={(e) => handleSettingChange('VE', 'usShipping', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">International Shipping ($)</label>
                    <input
                      type="number"
                      value={settings.VE.internationalShipping}
                      onChange={(e) => handleSettingChange('VE', 'internationalShipping', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Box ($)</label>
                    <input
                      type="number"
                      value={settings.VE.box}
                      onChange={(e) => handleSettingChange('VE', 'box', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Cable ($)</label>
                    <input
                      type="number"
                      value={settings.VE.cable}
                      onChange={(e) => handleSettingChange('VE', 'cable', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Charger ($)</label>
                    <input
                      type="number"
                      value={settings.VE.charger}
                      onChange={(e) => handleSettingChange('VE', 'charger', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>

              {/* US Shipping */}
              <div className="premium-card p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">US Shipping Costs</h3>
                    <p className="text-zinc-400 text-sm">Shipping and packaging costs for US market</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">US Shipping ($)</label>
                    <input
                      type="number"
                      value={settings.US.usShipping}
                      onChange={(e) => handleSettingChange('US', 'usShipping', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Box ($)</label>
                    <input
                      type="number"
                      value={settings.US.box}
                      onChange={(e) => handleSettingChange('US', 'box', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Cable ($)</label>
                    <input
                      type="number"
                      value={settings.US.cable}
                      onChange={(e) => handleSettingChange('US', 'cable', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Charger ($)</label>
                    <input
                      type="number"
                      value={settings.US.charger}
                      onChange={(e) => handleSettingChange('US', 'charger', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'commission' && (
            <div className="space-y-6">
              {/* Venezuela Commission */}
              <div className="premium-card p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Percent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Venezuela Commission</h3>
                    <p className="text-zinc-400 text-sm">Commission settings for VE market</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Commission Type</label>
                    <select
                      value={settings.VE.commissionType}
                      onChange={(e) => handleSettingChange('VE', 'commissionType', e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Fee ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      {settings.VE.commissionType === 'percentage' ? 'Commission %' : 'Commission Amount ($)'}
                    </label>
                    <input
                      type="number"
                      value={settings.VE.commissionValue}
                      onChange={(e) => handleSettingChange('VE', 'commissionValue', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      max={settings.VE.commissionType === 'percentage' ? 100 : undefined}
                      step={settings.VE.commissionType === 'percentage' ? 0.1 : 0.5}
                    />
                  </div>
                </div>
              </div>

              {/* US Commission */}
              <div className="premium-card p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Percent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">US Commission</h3>
                    <p className="text-zinc-400 text-sm">Commission settings for US market</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Commission Type</label>
                    <select
                      value={settings.US.commissionType}
                      onChange={(e) => handleSettingChange('US', 'commissionType', e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Fee ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      {settings.US.commissionType === 'percentage' ? 'Commission %' : 'Commission Amount ($)'}
                    </label>
                    <input
                      type="number"
                      value={settings.US.commissionValue}
                      onChange={(e) => handleSettingChange('US', 'commissionValue', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      max={settings.US.commissionType === 'percentage' ? 100 : undefined}
                      step={settings.US.commissionType === 'percentage' ? 0.1 : 0.5}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="premium-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Additional Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">K Value (VE)</label>
                    <input
                      type="number"
                      value={settings.VE.kValue}
                      onChange={(e) => handleSettingChange('VE', 'kValue', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">K Value (US)</label>
                    <input
                      type="number"
                      value={settings.US.kValue}
                      onChange={(e) => handleSettingChange('US', 'kValue', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">F Value (VE)</label>
                    <input
                      type="number"
                      value={settings.VE.fValue}
                      onChange={(e) => handleSettingChange('VE', 'fValue', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">F Value (US)</label>
                    <input
                      type="number"
                      value={settings.US.fValue}
                      onChange={(e) => handleSettingChange('US', 'fValue', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Cap Value (VE)</label>
                    <input
                      type="number"
                      value={settings.VE.capValue}
                      onChange={(e) => handleSettingChange('VE', 'capValue', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Cap Value (US)</label>
                    <input
                      type="number"
                      value={settings.US.capValue}
                      onChange={(e) => handleSettingChange('US', 'capValue', parseFloat(e.target.value) || 0)}
                      className="input-premium w-full"
                      min="0"
                      step="5"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketSettings; 