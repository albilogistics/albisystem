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
import { getMarketSettings, calculateCommission, calculateSellPrice } from '../lib/utils';
import Notification from '../components/Notification';
import ClearOverridesButton from '../components/ClearOverridesButton';
import { useCart } from '../contexts/CartContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const Costs = () => {
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
    totalProfit: 0,
    averageMargin: 0,
    totalInventory: 0,
    totalCost: 0
  });
  const [settings, setSettings] = useState({
    VE: {
      LO: 0.15, HI: 0.35, K: 0.01, F: 5, capVal: 50,
      SC_VE: 0, VE_SHIPPING: 25, VE_BOX: 5, VE_CABLE: 3
    },
    US: {
      LO: 0.20, HI: 0.40, K: 0.015, F: 8, capVal: 75,
      SC_US: 0, US_SHIPPING: 20, US_BOX: 4, US_CABLE: 2
    }
  });

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

  // Comprehensive inventory data with all required fields
  const [inventoryData, setInventoryData] = useState([]);

  useEffect(() => {
    fetchData();
    calculateStats();
  }, [market]);

  // Listen for market settings changes
  useEffect(() => {
    const handleSettingsChange = () => {
      // Refetch data from backend when settings change
      fetchData();
    };

    window.addEventListener('marketSettingsChanged', handleSettingsChange);
    return () => {
      window.removeEventListener('marketSettingsChanged', handleSettingsChange);
    };
  }, [market]);

  // Listen for refreshCostsData event to auto-refresh after saving settings
  useEffect(() => {
    const handleRefresh = () => {
      fetchData();
    };
    window.addEventListener('refreshCostsData', handleRefresh);
    return () => {
      window.removeEventListener('refreshCostsData', handleRefresh);
    };
  }, []);

  const recalculatePrices = () => {
    // Refetch data from backend to get updated calculations
    fetchData();
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
    console.log('🔍 [Costs] Fetching data from API...', `${API_BASE_URL}/costs`);
    try {
      const res = await axios.get(`${API_BASE_URL}/costs`);
      console.log('📡 [Costs] API Response:', res.data);
      
      if (res.data.success) {
        // Filter data by selected market first, then transform
        const marketFilteredData = res.data.data.filter(item => item.market === market);
        console.log(`📊 [Costs] Filtered data for market ${market}:`, marketFilteredData.length, 'items');
        
        // Transform the data to match the expected format
        const transformedData = marketFilteredData.map(item => {
          // Clean up grade by removing "DLS" prefix
          const cleanGrade = item.grade ? item.grade.replace('DLS ', '') : item.grade;
          
          // Use the data from the backend (which is already calculated correctly)
          const sellPrice = item.sellPrice || 0;
          const totalCost = item.totalCost || 0;
          
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
            basePrice: item.basePrice || 0,
            cost: totalCost,
            sellPrice: sellPrice,
            overridePrice: overridePrice,
            originalPrice: originalPrice,
            commission: item.commission || 0,
            shipping: item.shippingCost || 0,
            box: item.additionalCost ? item.additionalCost / 3 : 0, // Estimate box cost
            cable: item.additionalCost ? item.additionalCost / 3 : 0, // Estimate cable cost
            market: item.market, // Use backend value
            lastUpdated: item.inventoryLastUpdated || item.priceLastUpdated || item.lastUpdated || 'Never',
            isOverride: isOverride,
            isCommission: true,
            totalCost: totalCost,
            additionalCost: item.additionalCost || 0,
            repairCost: item.repairCost || 0,
            partsCost: item.partsCost || 0,
            margin: item.margin || 0,
            profitUSD: item.profitUSD || 0,
            finalPrice: item.finalPrice || 0,
            customerPrice: item.customerPrice || 0,
            marginPercent: item.marginPercent || 0
          };
        });
        console.log('✅ [Costs] Transformed data:', transformedData.length, 'items');
        setInventoryData(transformedData);
      } else {
        console.error('❌ [Costs] API returned success: false');
        setInventoryData([]);
      }
    } catch (e) {
      console.error('❌ [Costs] Error fetching costs data:', e);
      // Don't use mock data - show empty state instead
      setInventoryData([]);
      setNotification({ 
        message: 'Failed to load data. Please check your connection and try again.', 
        type: 'error' 
      });
      setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    }
    setLoading(false);
  };

  const calculateStats = () => {
    const filteredData = inventoryData; // Show all data with selected market pricing
    
    const totalProducts = filteredData.length;
    const totalInventory = filteredData.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const totalCost = filteredData.reduce((sum, item) => sum + (item.totalCost * item.quantity), 0);
    const totalProfit = totalRevenue - totalCost;
    const averageMargin = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    const averagePrice = totalProducts > 0 ? totalRevenue / totalInventory : 0;

    setStats({
      totalProducts,
      averagePrice,
      priceChanges: 3,
      totalRevenue,
      totalProfit,
      averageMargin,
      totalInventory,
      totalCost
    });
  };

  // Calculation functions with market settings
  // const marketSettings = getMarketSettings(market); // Removed as per edit hint
  
  // const calculateTotalCost = (item) => { // Removed as per edit hint
  //   // Use the totalCost field if it's already calculated
  //   if (item.totalCost && item.totalCost > 0) {
  //     return item.totalCost;
  //   }
    
  //   // Calculate with market-specific shipping and packaging costs
  //   const baseCost = item.basePrice || 0;
  //   const shippingCost = marketSettings.usShipping || 0;
  //   const boxCost = marketSettings.box || 0;
  //   const cableCost = marketSettings.cable || 0;
  //   const chargerCost = marketSettings.charger || 0;
    
  //   return baseCost + shippingCost + boxCost + cableCost + chargerCost;
  // };

  // const getActualSellPrice = (item) => { // Removed as per edit hint
  //   return item.isOverride && item.overridePrice ? item.overridePrice : item.sellPrice;
  // };

  // const calculateProfit = (item) => { // Removed as per edit hint
  //   const totalCost = calculateTotalCost(item);
  //   const actualPrice = getActualSellPrice(item);
  //   return actualPrice - totalCost;
  // };

  // const calculateProfitMargin = (item) => { // Removed as per edit hint
  //   const totalCost = calculateTotalCost(item);
  //   const profit = calculateProfit(item);
  //   return totalCost > 0 ? (profit / totalCost) * 100 : 0;
  // };

  // const calculateProfitUSD = (item) => { // Removed as per edit hint
  //   return calculateProfit(item);
  // };

  // const calculateCommissionAmount = (item) => { // Removed as per edit hint
  //   const actualPrice = getActualSellPrice(item);
  //   return calculateCommission(actualPrice, marketSettings);
  // };

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
    const currentData = inventoryData; // Use all data
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

  // Enhanced Override functions
  const toggleOverride = (item) => {
    setInventoryData(prev => prev.map(inv => 
      inv.id === item.id 
        ? { 
            ...inv, 
            isOverride: !inv.isOverride, 
            overridePrice: !inv.isOverride ? inv.sellPrice : null,
            originalPrice: inv.originalPrice || inv.sellPrice // Store original price
          }
        : inv
    ));
    calculateStats(); // Recalculate stats when override changes
  };

  const updateOverridePrice = (item, price) => {
    setInventoryData(prev => prev.map(inv => 
      inv.id === item.id 
        ? { 
            ...inv, 
            overridePrice: parseFloat(price) || null,
            originalPrice: inv.originalPrice || inv.sellPrice // Store original price if not already stored
          }
        : inv
    ));
  };

  const resetOverride = (item) => {
    // Remove from localStorage
    const newOverrideData = { ...overrideData };
    delete newOverrideData[item.id];
    setOverrideData(newOverrideData);
    localStorage.setItem('overrideData', JSON.stringify(newOverrideData));
    
    setInventoryData(prev => prev.map(inv => 
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
    setInventoryData(prev => prev.map(inv => ({
      ...inv,
      isOverride: false,
      overridePrice: null,
      sellPrice: inv.originalPrice || inv.sellPrice
    })));
    calculateStats();
  };

  const saveOverride = async (item) => {
    try {
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
      
      // Update the item with the saved override
      setInventoryData(prev => prev.map(inv => 
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
      setNotification({ message: 'Override saved successfully!', type: 'success' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error saving override:', error);
      // Show error notification
      setNotification({ message: 'Failed to save override. Please try again.', type: 'error' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }
  };

  // Filter and search
  const filteredData = inventoryData.filter(item => {
    const matchesSearch = item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.color.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.grade === selectedFilter;
    const matchesModel = selectedModelFilter === 'all' || item.model === selectedModelFilter;
    const matchesCapacity = selectedCapacityFilter === 'all' || item.capacity === selectedCapacityFilter;
    const matchesMarket = item.market === market;
    return matchesSearch && matchesFilter && matchesModel && matchesCapacity && matchesMarket;
  });

  // Get unique models and capacities for filters
  const uniqueModels = [...new Set(inventoryData.filter(item => item.market === market).map(item => item.model))];
  const uniqueCapacities = [...new Set(inventoryData.filter(item => item.market === market).map(item => item.capacity))];

  const exportToCSV = (type = 'filtered') => {
    let dataToExport = [];
    let filename = '';
    
    switch (type) {
      case 'full':
        dataToExport = inventoryData.filter(item => item.market === market);
        filename = `costs-full-${market}-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'selected':
        dataToExport = inventoryData.filter(item => selectedItems.includes(item.id));
        filename = `costs-selected-${market}-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'filtered':
        dataToExport = filteredData;
        filename = `costs-filtered-${market}-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'client':
        dataToExport = filteredData;
        filename = `client-price-list-${market}-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      default:
        dataToExport = filteredData;
        filename = `costs-${market}-${new Date().toISOString().split('T')[0]}.csv`;
    }

    const headers = [
      'Product Description', 'Model', 'Grade', 'Capacity', 'Color', 'Inventory', 'Base Price', 'Total Cost', 
      'Sell Price', 'Customer Price', 'Margin %', 'Profit USD', 'Commission', 'Status', 'Market', 'Last Updated'
    ];
    
    const rows = dataToExport.map(item => [
      `"${item.model} ${item.grade} ${item.capacity} ${item.color}"`,
      `"${item.model}  "`,  // Add extra spaces to ensure full model name is visible
      `"${item.grade}"`,
      `"${item.capacity}"`,
      `"${item.color}"`,
      `"${item.quantity}"`,
      `"$${item.basePrice}"`,
      `"$${item.totalCost}"`,
      `"$${item.finalPrice ? parseFloat(item.finalPrice).toFixed(2) : (item.sellPrice ? parseFloat(item.sellPrice).toFixed(2) : 'N/A')}"`,
      `"$${(item.customerPrice ? parseFloat(item.customerPrice) : (item.finalPrice ? parseFloat(item.finalPrice) : (parseFloat(item.sellPrice) + parseFloat(item.commission)))).toFixed(2)}"`,
      `"${item.marginPercent ? parseFloat(item.marginPercent).toFixed(1) : '0.0'}%"`,
      `"$${item.profitUSD}"`,
      `"$${item.commission}"`,
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
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Cost Management</h1>
              <p className="text-zinc-400 text-sm">Complete cost analysis with profit margins and overrides</p>
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
                      📊 Costs and Margin Full Sheet
                    </button>
                    <button
                      onClick={() => exportToCSV('selected')}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      ✅ Selected Items Only
                    </button>
                    <button
                      onClick={() => exportToCSV('filtered')}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      🔍 Filtered Sheet
                    </button>
                    <div className="border-t border-zinc-700 my-1"></div>
                    <button
                      onClick={() => exportToCSV('client')}
                      className="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      👥 Client Price List
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
                <h3 className="text-lg font-semibold text-white">Total Profit</h3>
                <p className="text-zinc-400 text-sm">Net earnings</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
        </div>
            <div className="text-3xl font-bold text-blue-400">${(stats.totalProfit / 1000).toFixed(1)}k</div>
          </div>

          <div className="premium-card p-6 premium-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Avg Margin</h3>
                <p className="text-zinc-400 text-sm">Profit percentage</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                <Percent className="w-6 h-6 text-purple-400" />
        </div>
            </div>
            <div className="text-3xl font-bold text-purple-400">{stats.averageMargin.toFixed(1)}%</div>
          </div>

          <div className="premium-card p-6 premium-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Total Inventory</h3>
                <p className="text-zinc-400 text-sm">Units in stock</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-indigo-400" />
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

        {/* Cost Analysis List */}
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Cost Analysis</h3>
              <p className="text-zinc-400 text-sm">
                Showing {filteredData.length} of {inventoryData.length} products for {market} market
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
          <div className="grid grid-cols-12 gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50 mb-4 text-sm font-medium text-zinc-300">
            <div className="col-span-1">Select</div>
            <div className="col-span-2">Product</div>
            <div className="col-span-1">Inventory</div>
            <div className="col-span-1">Base Price</div>
            <div className="col-span-1">Total Cost</div>
            <div className="col-span-1">Sell Price</div>
            <div className="col-span-1">Customer Price</div>
            <div className="col-span-1">Margin</div>
            <div className="col-span-1">Profit</div>
            <div className="col-span-1">Commission</div>
            <div className="col-span-1">Action</div>
            <div className="col-span-1">Status</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2">
            {filteredData.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 p-4 bg-zinc-900/30 rounded-lg border border-zinc-800/30 hover:bg-zinc-900/50 transition-all duration-200">
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

                {/* Inventory */}
                <div className="col-span-1 flex items-center">
                  <div className="text-white font-medium">{item.quantity}</div>
                </div>

                {/* Base Price */}
                <div className="col-span-1 flex items-center">
                  <div className="text-zinc-300">${item.basePrice}</div>
                </div>

                {/* Total Cost */}
                <div className="col-span-1 flex items-center">
                  <div className="text-zinc-300">${item.totalCost}</div>
                </div>

                {/* Sell Price */}
                <div className="col-span-1 flex items-center">
                  {editingItem === item.id ? (
                    <input
                      type="number"
                      value={item.overridePrice || item.sellPrice}
                      onChange={(e) => updateOverridePrice(item, e.target.value)}
                      className="input-premium w-full text-sm"
                      placeholder="Price"
                    />
                  ) : (
                    <div className="flex flex-col">
                      <div className={`font-medium ${item.isOverride ? 'text-orange-400' : 'text-white'}`}>
                        ${item.sellPrice ? parseFloat(item.sellPrice).toFixed(2) : 'N/A'}
                      </div>
                      {item.isOverride && item.overridePrice !== item.sellPrice && (
                        <div className="text-xs text-zinc-500 line-through">
                          ${item.sellPrice}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Customer Price (Sell Price + Commission) */}
                <div className="col-span-1 flex items-center">
                  <div className="font-medium text-blue-400">
                    ${item.customerPrice ? parseFloat(item.customerPrice).toFixed(2) : 'N/A'}
                  </div>
                </div>

                {/* Margin */}
                <div className="col-span-1 flex items-center">
                  <div className={`font-medium ${item.marginPercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.marginPercent ? parseFloat(item.marginPercent).toFixed(1) : '0.0'}%
                  </div>
                </div>

                {/* Profit */}
                <div className="col-span-1 flex items-center">
                  <div className={`font-medium ${item.profitUSD > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${item.profitUSD.toFixed(0)}
                  </div>
                </div>

                {/* Commission */}
                <div className="col-span-1 flex items-center">
                  <div className="flex flex-col">
                    <div className="text-zinc-300">
                      ${item.commission.toFixed(2)}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {/* Removed marketSettings.commissionType and marketSettings.commissionValue */}
                    </div>
                  </div>
                </div>
      
                {/* Actions */}
                <div className="col-span-1 flex items-center space-x-2">
                  {editingItem === item.id ? (
                    <>
                      <button
                        onClick={() => saveOverride(item)}
                        className="p-1 text-green-400 hover:text-green-300 transition-colors"
                        title="Save Override"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingItem(item.id)}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit Price"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {item.isOverride && (
                        <button
                          onClick={() => resetOverride(item)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Reset to Original Price"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => addToCart({
                          ...item,
                          finalPrice: item.customerPrice || item.sellPrice,
                          customerPrice: item.customerPrice || item.sellPrice
                        })}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-all duration-200"
                        title="Add to Cart"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </>
                  )}
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Costs; 