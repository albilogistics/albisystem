import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Database, Globe, Shield } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const SettingsManager = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeMarket, setActiveMarket] = useState('VE'); // 'VE' or 'US'

  // Settings structure by market
  const settingsStructure = {
    VE: {
      title: 'Venezuela Market Settings',
      icon: Globe,
      settings: {
        LO: { value: '0.15', label: 'Low Markup %', description: 'Minimum markup percentage', type: 'number' },
        HI: { value: '0.35', label: 'High Markup %', description: 'Maximum markup percentage', type: 'number' },
        K: { value: '0.01', label: 'Sigmoid Steepness', description: 'Curve steepness factor', type: 'number' },
        F: { value: '5', label: 'Fixed Profit ($)', description: 'Base fixed profit amount', type: 'number' },
        capVal: { value: '50', label: 'Max Profit Cap ($)', description: 'Maximum profit per item', type: 'number' },
        SC_VE: { value: '0', label: 'VE Shipping Cost ($)', description: 'Shipping cost for Venezuela', type: 'number' },
        VE_SHIPPING: { value: '0', label: 'VE Additional Shipping ($)', description: 'Additional Venezuela shipping', type: 'number' },
        VE_BOX: { value: '0', label: 'VE Box Cost ($)', description: 'Box cost for Venezuela', type: 'number' },
        VE_CABLE: { value: '0', label: 'VE Cable Cost ($)', description: 'Cable cost for Venezuela', type: 'number' }
      }
    },
    US: {
      title: 'USA Market Settings',
      icon: Shield,
      settings: {
        LO: { value: '0.15', label: 'Low Markup %', description: 'Minimum markup percentage', type: 'number' },
        HI: { value: '0.35', label: 'High Markup %', description: 'Maximum markup percentage', type: 'number' },
        K: { value: '0.01', label: 'Sigmoid Steepness', description: 'Curve steepness factor', type: 'number' },
        F: { value: '5', label: 'Fixed Profit ($)', description: 'Base fixed profit amount', type: 'number' },
        capVal: { value: '50', label: 'Max Profit Cap ($)', description: 'Maximum profit per item', type: 'number' },
        SC_US: { value: '0', label: 'US Shipping Cost ($)', description: 'Shipping cost for US', type: 'number' }
      }
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/settings`);
      
      if (response.data.success) {
        const settingsMap = {};
        response.data.data.forEach(setting => {
          settingsMap[setting.key] = setting.value;
        });
        setSettings(settingsMap);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Get current market settings
      const currentMarketSettings = settingsStructure[activeMarket].settings;
      
      // Save only the current market's settings
      const savePromises = Object.keys(currentMarketSettings).map(key =>
        axios.put(`${API_BASE_URL}/settings/${key}`, { value: settings[key] || currentMarketSettings[key].value })
      );

      await Promise.all(savePromises);
      
      // Refresh settings to confirm
      await fetchSettings();
      
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const currentMarketSettings = settingsStructure[activeMarket].settings;
    const resetSettings = { ...settings };
    
    Object.keys(currentMarketSettings).forEach(key => {
      resetSettings[key] = currentMarketSettings[key].value;
    });
    
    setSettings(resetSettings);
  };

  if (loading) {
    return (
      <div className="flex-grow bg-black overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  const currentMarketConfig = settingsStructure[activeMarket];
  const MarketIcon = currentMarketConfig.icon;

  return (
    <div className="flex-grow bg-black overflow-y-auto">
      {/* Header */}
      <div className="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-zinc-800 bg-black sticky top-0 z-30">
        <div className="flex w-full items-center">
          <div className="flex items-center text-3xl text-white">
            <Settings className="w-8 h-8 mr-3 text-blue-400" />
            <h1 className="text-2xl font-bold">Admin Settings</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Market:</span>
              <select 
                value={activeMarket} 
                onChange={(e) => setActiveMarket(e.target.value)}
                className="bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="VE">Venezuela</option>
                <option value="US">USA</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sm:p-7 p-4 space-y-6">
        {/* Market Settings Card */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
              <MarketIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{currentMarketConfig.title}</h2>
              <p className="text-zinc-400 text-sm">Configure pricing parameters for {activeMarket === 'VE' ? 'Venezuela' : 'USA'} market</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(currentMarketConfig.settings).map(([key, config]) => (
              <div key={key} className="space-y-3">
                <label className="text-white font-medium text-sm">{config.label}</label>
                <input
                  type={config.type}
                  value={settings[key] || config.value}
                  onChange={(e) => handleSettingChange(key, e.target.value)}
                  className="w-full px-4 py-3 border border-zinc-700 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={config.value}
                />
                <p className="text-zinc-400 text-xs">{config.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-2xl p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all duration-200 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Defaults
          </button>
        </div>

        {/* Connection Status */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-white font-medium">Connected to Pricing Engine</span>
            </div>
            <div className="text-zinc-400 text-sm">Settings will apply to all pricing calculations</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager; 