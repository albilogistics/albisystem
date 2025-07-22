import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function SyncButton({ onSyncComplete }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus('Starting sync...');
      
      const response = await fetch(`${API_BASE_URL}/sync/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSyncStatus('Sync completed successfully!');
        // Clear status after 3 seconds
        setTimeout(() => setSyncStatus(null), 3000);
        if (onSyncComplete) onSyncComplete();
      } else {
        setSyncStatus(`Sync failed: ${result.error}`);
        // Clear error after 5 seconds
        setTimeout(() => setSyncStatus(null), 5000);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus(`Sync failed: ${error.message}`);
      // Clear error after 5 seconds
      setTimeout(() => setSyncStatus(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2 shadow-lg"
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Sync Data'}
      </button>
      {syncStatus && (
        <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
          syncStatus.includes('failed') 
            ? 'bg-red-500/20 text-red-300 border border-red-800' 
            : 'bg-green-500/20 text-green-300 border border-green-800'
        }`}>
          {syncStatus}
        </div>
      )}
    </div>
  );
} 