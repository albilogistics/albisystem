import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import EditablePriceCard from './EditablePriceCard';
import SyncButton from './SyncButton';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const PriceDashboard = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    model: '',
    grade: '',
    capacity: ''
  });
  
  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    models: [],
    grades: [],
    capacities: []
  });

  // Manual sync function
  const handleManualSync = async () => {
    try {
      setSyncing(true);
      setSyncStatus('Starting sync...');
      
      const response = await axios.post(`${API_BASE_URL}/sync`);
      
      if (response.data.success) {
        setSyncStatus('Sync completed successfully!');
        // Refresh prices after sync
        setTimeout(() => {
          fetchPrices();
          setSyncStatus(null);
        }, 2000);
      } else {
        setSyncStatus('Sync failed: ' + response.data.error);
      }
    } catch (err) {
      console.error('Sync error:', err);
      setSyncStatus('Sync failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSyncing(false);
    }
  };

  // Fetch prices from API
  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.model) params.append('model', filters.model);
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.capacity) params.append('capacity', filters.capacity);
      
      const response = await axios.get(`${API_BASE_URL}/admin-prices?${params}`);
      
      if (response.data.success) {
        // Transform flat data into grouped format
        const groupedData = response.data.data.reduce((groups, item) => {
          const key = `${item.model}-${item.grade}-${item.capacity}`;
          if (!groups[key]) {
            groups[key] = {
              model: item.model,
              grade: item.grade,
              capacity: item.capacity,
              variants: []
            };
          }
          groups[key].variants.push({
            color: item.color,
            quantity: item.quantity,
            listPrice: item.basePrice,
            sellPrice: item.customerPrice,
            margin: item.margin / 100, // Convert percentage to decimal
            method: 'calculated'
          });
          return groups;
        }, {});
        
        setPrices(Object.values(groupedData));
        
        // Extract filter options from data
        const models = [...new Set(response.data.data.map(item => item.model))];
        const grades = [...new Set(response.data.data.map(item => item.grade))];
        const capacities = [...new Set(response.data.data.map(item => item.capacity))];
        
        setFilterOptions({
          models: models.sort(),
          grades: grades.sort(),
          capacities: capacities.sort()
        });
      } else {
        setError('Failed to fetch prices');
      }
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError(err.response?.data?.error || 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `assurant-prices-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate CSV content
  const generateCSV = () => {
    const headers = ['Model', 'Grade', 'Capacity', 'Color', 'Quantity', 'List Price', 'Sell Price', 'Margin', 'Method'];
    const rows = [];
    
    prices.forEach(group => {
      group.variants.forEach(variant => {
        rows.push([
          group.model,
          group.grade,
          group.capacity,
          variant.color,
          variant.quantity,
          variant.listPrice,
          variant.sellPrice,
          `${(variant.margin * 100).toFixed(2)}%`,
          variant.method
        ]);
      });
    });
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      model: '',
      grade: '',
      capacity: ''
    });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle price updates
  const handlePriceUpdate = async (itemId, updatedData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/prices/${itemId}`, updatedData);
      
      if (response.data.success) {
        // Refresh prices to show updated data
        fetchPrices();
        console.log('Price updated successfully');
      } else {
        console.error('Failed to update price:', response.data.error);
      }
    } catch (err) {
      console.error('Error updating price:', err);
    }
  };

  // Handle price update cancellation
  const handlePriceUpdateCancel = () => {
    // Just refresh to ensure we have the latest data
    fetchPrices();
  };

  // Initial data fetch
  useEffect(() => {
    fetchPrices();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPrices();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [filters, fetchPrices]);

  // --- Dashboard Summary Cards ---
  const totalProducts = prices.length;
  const totalInventory = prices.reduce((sum, group) => sum + group.variants.reduce((s, v) => s + v.quantity, 0), 0);
  const lastSync = syncStatus && syncStatus.includes('completed') ? new Date().toLocaleString() : '—';

  if (loading && prices.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#18181b]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading prices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18181b] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#23232a] rounded-2xl p-6 flex flex-col shadow-lg border border-gray-800">
            <span className="text-gray-400 text-sm mb-2">Total Products</span>
            <span className="text-3xl font-bold text-cyan-400">{totalProducts}</span>
          </div>
          <div className="bg-[#23232a] rounded-2xl p-6 flex flex-col shadow-lg border border-gray-800">
            <span className="text-gray-400 text-sm mb-2">Total Inventory</span>
            <span className="text-3xl font-bold text-indigo-400">{totalInventory}</span>
          </div>
          <div className="bg-[#23232a] rounded-2xl p-6 flex flex-col shadow-lg border border-gray-800">
            <span className="text-gray-400 text-sm mb-2">Last Sync</span>
            <span className="text-lg font-semibold text-amber-300">{lastSync}</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
          <h1 className="text-3xl font-bold text-m2-dark-on-surface mb-2">
            Assurant Pricing Dashboard
          </h1>
          <p className="text-m2-dark-on-surface-variant">
            Venezuela pricing with real-time calculations and overrides
          </p>
            </div>
            
            {/* Manual Sync Button */}
            <div className="flex flex-col items-end space-y-2">
              <SyncButton onSyncComplete={fetchPrices} />
              
              {syncStatus && (
                <div className={`text-sm px-3 py-1 rounded ${
                  syncStatus.includes('failed') 
                    ? 'bg-red-500/20 text-red-300' 
                    : 'bg-green-500/20 text-green-300'
                }`}>
                  {syncStatus}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 items-end">
          <select
            className="bg-[#23232a] text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={filters.model}
            onChange={e => handleFilterChange('model', e.target.value)}
          >
            <option value="">All Models</option>
            {filterOptions.models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
          <select
            className="bg-[#23232a] text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={filters.grade}
            onChange={e => handleFilterChange('grade', e.target.value)}
          >
            <option value="">All Grades</option>
            {filterOptions.grades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
          <select
            className="bg-[#23232a] text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={filters.capacity}
            onChange={e => handleFilterChange('capacity', e.target.value)}
          >
            <option value="">All Capacities</option>
            {filterOptions.capacities.map(capacity => (
              <option key={capacity} value={capacity}>{capacity}</option>
            ))}
          </select>
          <button
            onClick={resetFilters}
            className="ml-2 px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={exportToCSV}
            className="ml-2 px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 transition-colors"
          >
            Export CSV
          </button>
          {syncStatus && <span className="ml-4 text-cyan-400 font-medium">{syncStatus}</span>}
        </div>

        {/* Error Display */}
        {error && (
          <div className="card mb-6 bg-m2-dark-error-container border-m2-dark-error">
            <p className="text-m2-dark-on-error-container">{error}</p>
          </div>
        )}

        {/* Results Summary */}
        <div className="card mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-m2-dark-on-surface mb-2">Results</h2>
              <p className="text-m2-dark-on-surface-variant">
                Showing {prices.length} product groups
              </p>
            </div>
            <button
              onClick={fetchPrices}
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Product Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {prices.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">No products found.</div>
          ) : (
            prices.flatMap((group, idx) => 
              group.variants.map((variant, vIdx) => (
                <EditablePriceCard
                  key={`${group.model}-${group.grade}-${group.capacity}-${variant.color}-${vIdx}`}
                  item={{
                    id: `${group.model}-${group.grade}-${group.capacity}-${variant.color}`,
                    model: group.model,
                    grade: group.grade,
                    capacity: group.capacity,
                    color: variant.color,
                    quantity: variant.quantity,
                    listPrice: variant.listPrice,
                    sellPrice: variant.sellPrice,
                    margin: variant.margin,
                    method: variant.method,
                    cost: variant.listPrice || 0, // Use listPrice as base cost
                    shipping: 0, // Default values
                    box: 0,
                    cable: 0
                  }}
                  onSave={handlePriceUpdate}
                  onCancel={handlePriceUpdateCancel}
                />
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceDashboard; 