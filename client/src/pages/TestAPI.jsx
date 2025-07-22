import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestAPI = () => {
  const [ordersData, setOrdersData] = useState(null);
  const [financingData, setFinancingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    testAPICalls();
  }, []);

  const testAPICalls = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test orders API
      console.log('Testing orders API...');
      const ordersResponse = await axios.get('http://localhost:3001/api/orders');
      console.log('Orders API response:', ordersResponse.data);
      setOrdersData(ordersResponse.data);

      // Test financing analytics API
      console.log('Testing financing analytics API...');
      const financingResponse = await axios.get('http://localhost:3001/api/financing/analytics');
      console.log('Financing API response:', financingResponse.data);
      setFinancingData(financingResponse.data);

    } catch (err) {
      console.error('API test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow bg-black overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 text-white">⏳</div>
          </div>
          <p className="text-zinc-400">Testing API connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-black overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">API Test Results</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <h2 className="text-red-400 font-semibold mb-2">Error</h2>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders API Test */}
          <div className="bg-zinc-900/50 border border-zinc-700/30 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Orders API</h2>
            {ordersData ? (
              <div>
                <p className="text-green-400 mb-2">✅ Success</p>
                <p className="text-zinc-400 text-sm mb-2">
                  Orders found: {ordersData.data?.length || 0}
                </p>
                <details className="text-xs">
                  <summary className="text-zinc-400 cursor-pointer">View Response</summary>
                  <pre className="text-zinc-500 mt-2 overflow-auto">
                    {JSON.stringify(ordersData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-red-400">❌ Failed</p>
            )}
          </div>

          {/* Financing API Test */}
          <div className="bg-zinc-900/50 border border-zinc-700/30 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Financing Analytics API</h2>
            {financingData ? (
              <div>
                <p className="text-green-400 mb-2">✅ Success</p>
                <p className="text-zinc-400 text-sm mb-2">
                  Total Financed: ${financingData.data?.totalFinanced || 0}
                </p>
                <details className="text-xs">
                  <summary className="text-zinc-400 cursor-pointer">View Response</summary>
                  <pre className="text-zinc-500 mt-2 overflow-auto">
                    {JSON.stringify(financingData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-red-400">❌ Failed</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={testAPICalls}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestAPI; 