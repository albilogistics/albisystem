import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Search, Download, DollarSign, TrendingUp, BarChart3, Sparkles, 
  ArrowUpRight, ArrowDownRight, Zap, RefreshCw, Eye, Calculator, 
  Globe, Settings, FileText, AlertCircle, Percent, Target, Activity,
  CheckSquare, Square, Edit3, Save, X, Filter, Plus, MoreVertical,
  Star, StarOff, TrendingDown, Package, Truck, CreditCard, ChevronDown,
  PlusCircle
} from 'lucide-react';
import { getMarketSettings, calculateSellPrice, calculateCommission } from '../lib/utils';
import Notification from '../components/Notification';
import ClearOverridesButton from '../components/ClearOverridesButton';
import { useCart } from '../contexts/CartContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const Prices = () => {
  const { addToCart } = useCart();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState('VE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedModelFilter, setSelectedModelFilter] = useState('all');
  const [selectedCapacityFilter, setSelectedCapacityFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    averagePrice: 0,
    priceChanges: 0,
    totalRevenue: 0,
    totalInventory: 0
  });

  // Get market settings
  const marketSettings = getMarketSettings(market);

  // Sync state
  const [syncStatus, setSyncStatus] = useState({
    isSyncing: false,
    lastSync: null,
    syncType: null,
    error: null
  });

  // Export dropdown state
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  // Load override data from localStorage
  const [overrideData, setOverrideData] = useState(() => {
    try {
      const saved = localStorage.getItem('overrideData');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading override data:', error);
      return {};
    }
  });

  // Enhanced pricing data with override information
  const [pricingData, setPricingData] = useState([]);

  useEffect(() => {
    fetchData();
    calculateStats();
  }, [market]);

  // Listen for market settings changes
  useEffect(() => {
    const handleSettingsChange = () => {
      recalculatePrices();
    };

    const handleOverrideDataChange = (event) => {
      const { itemId, overrideInfo } = event.detail;
      if (overrideInfo) {
        // Update override data
        setOverrideData(prev => ({
          ...prev,
          [itemId]: overrideInfo
        }));
      } else {
        // Remove override data
        setOverrideData(prev => {
          const newData = { ...prev };
          delete newData[itemId];
          return newData;
        });
      }
      // Recalculate prices to apply override changes
      recalculatePrices();
    };

    window.addEventListener('marketSettingsChanged', handleSettingsChange);
    window.addEventListener('overrideDataChanged', handleOverrideDataChange);
    return () => {
      window.removeEventListener('marketSettingsChanged', handleSettingsChange);
      window.removeEventListener('overrideDataChanged', handleOverrideDataChange);
    };
  }, []);

  const recalculatePrices = () => {
    setPricingData(prev => prev.map(item => {
      if (item.isOverride && item.overridePrice) {
        // Keep override prices unchanged
        return item;
      }
      
      // For prices tab, we need to estimate the cost from the current sell price
      // and then recalculate based on new settings
      const estimatedCost = item.sellPrice / 1.3; // Rough estimate
      const newSellPrice = calculateSellPrice(estimatedCost, item.market);
      
      return {
        ...item,
        sellPrice: newSellPrice
      };
    }));
    
    calculateStats();
  };

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownOpen && !event.target.closest('.export-dropdown')) {
        setExportDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exportDropdownOpen]);

      const fetchData = async () => {
    setLoading(true);
    console.log('🔍 Fetching data from API...', `${API_BASE_URL}/costs`);
    try {
      const res = await axios.get(`${API_BASE_URL}/costs`);
      console.log('📡 API Response:', res.data);
      
      if (res.data.success) {
        // Filter data by selected market first, then transform
        const marketFilteredData = res.data.data.filter(item => item.market === market);
        console.log(`📊 Filtered data for market ${market}:`, marketFilteredData.length, 'items');
        
        // Transform the data to match the expected format and clean up grades
        const transformedData = marketFilteredData.map(item => {
          // Clean up grade by removing "DLS" prefix
          const cleanGrade = item.grade ? item.grade.replace('DLS ', '') : item.grade;
          
          // Use the sell price from the backend (which is already calculated correctly)
          const sellPrice = item.sellPrice || 0;
          
          // Apply override data if it exists
          const itemOverride = overrideData[item.id] || {};
          const isOverride = itemOverride.isOverride || item.isOverride || false;
          const overridePrice = itemOverride.overridePrice || item.overridePrice;
          const originalPrice = itemOverride.originalPrice || sellPrice;
          
          return {
            id: item.id,
            model: item.model,
            grade: cleanGrade,
            capacity: item.capacity,
            color: item.color,
            quantity: item.quantity || 0,
            sellPrice: sellPrice,
            overridePrice: overridePrice,
            originalPrice: originalPrice,
            isOverride: isOverride,
            market: item.market, // Use backend value
            lastUpdated: item.inventoryLastUpdated || item.priceLastUpdated || item.lastUpdated || 'Never',
            totalCost: item.totalCost,
            finalPrice: item.finalPrice,
            margin: item.margin,
            marginPercent: item.marginPercent
          };
        });
        console.log('✅ Transformed data:', transformedData.length, 'items');
        console.log('📅 Sample timestamps:', transformedData.slice(0, 3).map(item => ({
          model: item.model,
          lastUpdated: item.lastUpdated
        })));
        setPricingData(transformedData);
      } else {
        console.error('❌ API returned success: false');
        setPricingData([]);
      }
    } catch (e) {
      console.error('❌ Error fetching costs data:', e);
      // Don't use mock data - show empty state instead
      setPricingData([]);
      setNotification({ 
        message: 'Failed to load data. Please check your connection and try again.', 
        type: 'error' 
      });
      setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    }
    setLoading(false);
  };

  const calculateStats = () => {
    const filteredData = pricingData; // Show all data with selected market pricing
    
    const totalProducts = filteredData.length;
    const totalInventory = filteredData.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const averagePrice = totalProducts > 0 ? totalRevenue / totalInventory : 0;

    setStats({
      totalProducts,
      averagePrice,
      priceChanges: 3,
      totalRevenue,
      totalInventory
    });
  };

  // Helper function to get actual sell price (override or regular)
  const getActualSellPrice = (item) => {
    return item.isOverride && item.overridePrice ? item.overridePrice : item.sellPrice;
  };

  // Add commission calculation function to match Costs tab
  const calculateCommissionAmount = (item) => {
    const actualPrice = getActualSellPrice(item);
    return calculateCommission(actualPrice, marketSettings);
  };

  // Sync functions
  const syncPrices = async (type = 'full') => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncType: type, error: null }));
    
    try {
      const response = await axios.post(`${API_BASE_URL}/sync/manual`);
      
      if (response.data.success) {
        setSyncStatus({
          isSyncing: false,
          lastSync: new Date(),
          syncType: type,
          error: null
        });
        
        // Force refresh data after sync with delay to ensure backend has updated
        setTimeout(async () => {
          await fetchData();
          calculateStats();
        }, 2000);
      }
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        error: error.response?.data?.message || error.message 
      }));
    }
  };

  const syncAllData = async () => await syncPrices('full');

  // Selection functions
  const toggleSelectAll = () => {
    const currentData = pricingData; // Use all data
    if (selectedItems.length === currentData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentData.map(item => item.id));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  // Price update functions
  const updatePrice = (item, price) => {
    setPricingData(prev => prev.map(inv => 
      inv.id === item.id 
        ? { 
            ...inv, 
            overridePrice: parseFloat(price) || 0,
            originalPrice: inv.originalPrice || inv.sellPrice // Store original price if not already stored
          }
        : inv
    ));
  };

  const savePrice = (item) => {
    const overrideInfo = {
      isOverride: true,
      overridePrice: parseFloat(item.overridePrice) || item.sellPrice,
      originalPrice: item.originalPrice || item.sellPrice,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    // Save to localStorage
    const newOverrideData = {
      ...overrideData,
      [item.id]: overrideInfo
    };
    setOverrideData(newOverrideData);
    localStorage.setItem('overrideData', JSON.stringify(newOverrideData));
    
    setPricingData(prev => prev.map(inv => 
      inv.id === item.id 
        ? { 
            ...inv, 
            ...overrideInfo
          }
        : inv
    ));
    setEditingItem(null);
    calculateStats();
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('overrideDataChanged', { 
      detail: { itemId: item.id, overrideInfo } 
    }));
    
    // Show success notification
    setNotification({ message: 'Price override saved successfully!', type: 'success' });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const resetOverride = (item) => {
    // Remove from localStorage
    const newOverrideData = { ...overrideData };
    delete newOverrideData[item.id];
    setOverrideData(newOverrideData);
    localStorage.setItem('overrideData', JSON.stringify(newOverrideData));
    
    setPricingData(prev => prev.map(inv => 
      inv.id === item.id 
        ? { 
            ...inv, 
            isOverride: false,
            overridePrice: null,
            sellPrice: inv.originalPrice || inv.sellPrice,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : inv
    ));
    setEditingItem(null);
    calculateStats();
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('overrideDataChanged', { 
      detail: { itemId: item.id, overrideInfo: null } 
    }));
  };

  const clearAllOverrides = () => {
    setOverrideData({});
    setPricingData(prev => prev.map(inv => ({
      ...inv,
      isOverride: false,
      overridePrice: null,
      sellPrice: inv.originalPrice || inv.sellPrice
    })));
    calculateStats();
  };

  // Filter and search
  const filteredData = pricingData.filter(item => {
    const matchesSearch = item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.color.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.grade === selectedFilter;
    const matchesModel = selectedModelFilter === 'all' || item.model === selectedModelFilter;
    const matchesCapacity = selectedCapacityFilter === 'all' || item.capacity === selectedCapacityFilter;
    return matchesSearch && matchesFilter && matchesModel && matchesCapacity;
  });

  // Get unique models and capacities for filters
  const uniqueModels = [...new Set(pricingData.map(item => item.model))];
  const uniqueCapacities = [...new Set(pricingData.map(item => item.capacity))];

  const exportToCSV = (type = 'filtered') => {
    let dataToExport = [];
    let filename = '';
    
    switch (type) {
      case 'full':
        dataToExport = pricingData; // Export all data with selected market pricing
        filename = `prices-full-${market}-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'selected':
        dataToExport = pricingData.filter(item => selectedItems.includes(item.id));
        filename = `prices-selected-${market}-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'filtered':
        dataToExport = filteredData;
        filename = `prices-filtered-${market}-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      default:
        dataToExport = filteredData;
        filename = `prices-${market}-${new Date().toISOString().split('T')[0]}.csv`;
    }

    // Update exportToCSV to use the same commission calculation
    const headers = [
      'Product Description', 'Model', 'Grade', 'Capacity', 'Color', 'Quantity', 'Customer Price', 'Status', 'Market', 'Last Updated'
    ];
    
    const rows = dataToExport.map(item => [
      `"${item.model} ${item.grade} ${item.capacity} ${item.color}"`,
      `"${item.model}  "`,  // Add extra spaces to ensure full model name is visible
      `"${item.grade}"`,
      `"${item.capacity}"`,
      `"${item.color}"`,
      `"${item.quantity}"`,
      `"$${parseFloat(item.finalPrice).toFixed(2)}"`,
      `"${item.isOverride ? 'Override' : 'Active'}"`,
      `"${item.market}"`,
      `"${item.lastUpdated}"`
    ]);
    
    // Add header row with proper formatting
    const csvContent = [
      headers.map(header => `"${header}"`).join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setExportDropdownOpen(false);
  };

  return (
    <div className="flex-grow bg-black overflow-y-auto">
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })}
      />
      {/* Premium Header */}
      <div className="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-zinc-800/50 bg-black sticky top-0 z-30">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Pricing Management</h1>
              <p className="text-zinc-400 text-sm">Market-specific sell prices and inventory</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-zinc-800/50 rounded-lg p-1">
              <button
                onClick={() => setMarket('VE')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  market === 'VE' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                VE
              </button>
              <button
                onClick={() => setMarket('US')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  market === 'US' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                US
              </button>
            </div>
            
            {/* Enhanced Sync Buttons */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={fetchData}
                disabled={loading}
                className={`btn-secondary flex items-center space-x-2 transition-all duration-200 ${
                  loading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-blue-500/20'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button 
                onClick={syncAllData}
                disabled={syncStatus.isSyncing}
                className={`btn-premium flex items-center space-x-2 transition-all duration-200 ${
                  syncStatus.isSyncing 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-green-500/20'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync Data</span>
              </button>
            </div>
            
            <div className="relative export-dropdown">
              <button 
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="btn-premium flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {exportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50">
                  <div className="p-2">
                    <button
                      onClick={() => exportToCSV('full')}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      📊 Price List Full Sheet
                    </button>
                    <button
                      onClick={() => exportToCSV('selected')}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      ✅ Selected Price List
                    </button>
                    <button
                      onClick={() => exportToCSV('filtered')}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      🔍 Filtered Price List
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sm:p-7 p-4 space-y-6">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="premium-card p-6 premium-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Total Revenue</h3>
                <p className="text-zinc-400 text-sm">{market} Market</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-400">${(stats.totalRevenue / 1000).toFixed(1)}k</div>
          </div>

          <div className="premium-card p-6 premium-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Total Products</h3>
                <p className="text-zinc-400 text-sm">Active listings</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-400">{stats.totalProducts}</div>
          </div>

          <div className="premium-card p-6 premium-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Avg Price</h3>
                <p className="text-zinc-400 text-sm">Per product</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-400">${stats.averagePrice.toFixed(0)}</div>
          </div>

          <div className="premium-card p-6 premium-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Total Inventory</h3>
                <p className="text-zinc-400 text-sm">Units in stock</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalInventory}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="premium-card p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-premium w-full pl-10"
                />
              </div>
              
          <select 
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="input-premium pr-8"
                style={{ backgroundImage: 'none' }}
              >
                <option value="all">All Grades</option>
                <option value="A+">A+ Grade</option>
                <option value="A">A Grade</option>
                <option value="B+">B+ Grade</option>
                <option value="B">B Grade</option>
        </select>

          <select 
                value={selectedModelFilter}
                onChange={(e) => setSelectedModelFilter(e.target.value)}
                className="input-premium pr-8"
                style={{ backgroundImage: 'none' }}
              >
                <option value="all">All Models</option>
                {uniqueModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
        </select>

          <select 
                value={selectedCapacityFilter}
                onChange={(e) => setSelectedCapacityFilter(e.target.value)}
                className="input-premium pr-8"
                style={{ backgroundImage: 'none' }}
              >
                <option value="all">All Capacities</option>
                {uniqueCapacities.map(capacity => (
                  <option key={capacity} value={capacity}>{capacity}</option>
                ))}
        </select>

              <button className="btn-secondary flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <ClearOverridesButton onClearAll={clearAllOverrides} />
            </div>
            
            {/* Sync Status Indicator */}
            <div className="flex items-center space-x-3">
              {syncStatus.lastSync && (
                <div className="flex items-center space-x-2 text-sm text-zinc-400">
                  <div className={`w-2 h-2 rounded-full ${syncStatus.error ? 'bg-red-400' : 'bg-green-400'}`}></div>
                  <span>Last sync: {syncStatus.lastSync.toLocaleTimeString()}</span>
                </div>
              )}
              
              {syncStatus.isSyncing && (
                <div className="flex items-center space-x-2 text-sm text-blue-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing {syncStatus.syncType}...</span>
                </div>
              )}
              
              {syncStatus.error && (
                <div className="flex items-center space-x-2 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Sync failed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Simplified Pricing List */}
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Pricing List</h3>
              <p className="text-zinc-400 text-sm">
                Showing {filteredData.length} of {pricingData.length} products for {market} market
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleSelectAll}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              >
                {selectedItems.length === filteredData.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-8 gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50 mb-4 text-sm font-medium text-zinc-300">
            <div className="col-span-1">Select</div>
            <div className="col-span-2">Product</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-1">Customer Price</div>
            <div className="col-span-1">Last Updated</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2">
            {filteredData.map((item) => (
              <div key={item.id} className="grid grid-cols-8 gap-4 p-4 bg-zinc-900/30 rounded-lg border border-zinc-800/30 hover:bg-zinc-900/50 transition-all duration-200">
                {/* Select Checkbox */}
                <div className="col-span-1 flex items-center">
                  <button
                    onClick={() => toggleSelectItem(item.id)}
                    className="p-1 text-zinc-400 hover:text-white transition-colors"
                  >
                    {selectedItems.includes(item.id) ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Product Info */}
                <div className="col-span-2">
                  <div className="font-medium text-white">{item.model}</div>
                  <div className="text-sm text-zinc-400">
                    {item.grade} • {item.capacity} • {item.color}
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-1 flex items-center">
                  <div className="text-white font-medium">{item.quantity}</div>
                </div>

                {/* Customer Price (Sell Price + Commission) as main price */}
                <div className="col-span-1 flex items-center">
                  <div className="font-medium text-blue-400">
                    ${item.finalPrice ? parseFloat(item.finalPrice).toFixed(2) : (item.sellPrice ? parseFloat(item.sellPrice).toFixed(2) : 'N/A')}
                  </div>
                </div>

                {/* Last Updated */}
                <div className="col-span-1 flex items-center">
                  <div className="text-sm text-zinc-400">
                    {item.inventoryLastUpdated || item.priceLastUpdated || item.lastUpdated || 'Never'}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-1 flex items-center">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.isOverride 
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {item.isOverride ? 'Override' : 'Active'}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center">
                  <button
                    onClick={() => addToCart({
                      ...item,
                      finalPrice: item.finalPrice || item.sellPrice,
                      customerPrice: item.finalPrice || item.sellPrice
                    })}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-all duration-200"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prices; 