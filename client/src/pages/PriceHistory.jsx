import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import { History, TrendingUp, RefreshCw } from 'lucide-react';

const PriceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalChanges: 0,
    averageChange: 0,
    modelsUpdated: 0
  });

  const columns = [
    { key: 'product.model', header: 'Model' },
    { key: 'product.grade', header: 'Grade' },
    { key: 'product.capacity', header: 'Capacity' },
    { key: 'product.color', header: 'Color' },
    { key: 'oldPrice', header: 'Old Price', render: (value) => `$${value}` },
    { key: 'newPrice', header: 'New Price', render: (value) => `$${value}` },
    { key: 'changeType', header: 'Change Type' },
    { key: 'createdAt', header: 'Change Date', render: (value) => new Date(value).toLocaleDateString() },
  ];

  useEffect(() => {
    fetchPriceHistory();
  }, []);

  const fetchPriceHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/settings/price-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setHistory(response.data.data.history);
        
        // Calculate stats
        const changes = response.data.data.history;
        const totalChanges = changes.length;
        const averageChange = changes.length > 0 
          ? changes.reduce((sum, item) => sum + (parseFloat(item.newPrice) - parseFloat(item.oldPrice)), 0) / changes.length
          : 0;
        const modelsUpdated = new Set(changes.map(item => `${item.product?.model}-${item.product?.grade}`)).size;
        
        setStats({
          totalChanges,
          averageChange: Math.round(averageChange),
          modelsUpdated
        });
      }
    } catch (error) {
      console.error('Error fetching price history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow bg-black overflow-y-auto">
      {/* Header */}
      <div className="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-zinc-800 bg-black sticky top-0 z-30">
        <div className="flex w-full items-center">
          <div className="flex items-center text-3xl text-white">
            <History className="w-8 h-8 mr-3 text-blue-400" />
            <h1 className="text-2xl font-bold">Price History</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sm:p-7 p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Total Changes</h3>
                <p className="text-zinc-400 text-sm">All time</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalChanges}</div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Average Change</h3>
                <p className="text-zinc-400 text-sm">Price adjustment</p>
              </div>
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-400">${stats.averageChange}</div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Models Updated</h3>
                <p className="text-zinc-400 text-sm">Unique models</p>
              </div>
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.modelsUpdated}</div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Price Changes</h3>
              <p className="text-zinc-400 text-sm">Detailed history of all price adjustments</p>
            </div>
            <button
              onClick={fetchPriceHistory}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-zinc-400 mt-2">Loading price history...</p>
              </div>
            ) : (
              <DataTable data={history} columns={columns} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceHistory; 