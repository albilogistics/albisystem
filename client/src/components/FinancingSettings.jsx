import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  X, 
  DollarSign, 
  Calendar, 
  Bell, 
  Zap, 
  Shield, 
  Percent,
  Clock,
  AlertCircle,
  CheckCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const FinancingSettings = ({ isOpen, onClose, onSave }) => {
  const [settings, setSettings] = useState({
    defaultInterestRate: 1.5,
    interestPeriod: 7, // days
    autoCalculateInterest: true,
    sendReminders: true,
    reminderFrequency: 3, // days
    overdueThreshold: 7, // days
    maxInterestRate: 5.0,
    minInterestRate: 0.5,
    autoMarkOverdue: true,
    sendEmailNotifications: true,
    sendSMSNotifications: false,
    requireApproval: false,
    approvalThreshold: 10000, // amount
    gracePeriod: 3, // days
    lateFees: 25, // fixed amount
    lateFeeType: 'fixed', // fixed or percentage
    compoundingInterest: false,
    interestCap: 1000, // maximum interest amount
    paymentMethods: ['bank_transfer', 'zelle', 'check'],
    defaultPaymentTerms: 'Net 30',
    autoGenerateInvoices: true,
    invoiceFrequency: 7, // days
    taxIncluded: true,
    taxRate: 7.5,
    currency: 'USD',
    timezone: 'America/New_York'
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/financing/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching financing settings:', error);
      // Use default settings if API fails
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/financing/settings`, settings, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setNotification({ message: 'Settings saved successfully', type: 'success' });
        onSave?.(settings);
        onClose();
      } else {
        setNotification({ message: 'Failed to save settings', type: 'error' });
      }
    } catch (error) {
      console.error('Error saving financing settings:', error);
      setNotification({ message: 'Failed to save settings', type: 'error' });
    }
    setLoading(false);
  };

  const handleReset = () => {
    setSettings({
      defaultInterestRate: 1.5,
      interestPeriod: 7,
      autoCalculateInterest: true,
      sendReminders: true,
      reminderFrequency: 3,
      overdueThreshold: 7,
      maxInterestRate: 5.0,
      minInterestRate: 0.5,
      autoMarkOverdue: true,
      sendEmailNotifications: true,
      sendSMSNotifications: false,
      requireApproval: false,
      approvalThreshold: 10000,
      gracePeriod: 3,
      lateFees: 25,
      lateFeeType: 'fixed',
      compoundingInterest: false,
      interestCap: 1000,
      paymentMethods: ['bank_transfer', 'zelle', 'check'],
      defaultPaymentTerms: 'Net 30',
      autoGenerateInvoices: true,
      invoiceFrequency: 7,
      taxIncluded: true,
      taxRate: 7.5,
      currency: 'USD',
      timezone: 'America/New_York'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="premium-card p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Financing Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Interest Rate Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Percent className="w-5 h-5 text-blue-400" />
                <span>Interest Rate Configuration</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Default Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.defaultInterestRate}
                  onChange={(e) => setSettings({ ...settings, defaultInterestRate: parseFloat(e.target.value) || 0 })}
                  className="input-premium w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Interest Period (days)</label>
                <input
                  type="number"
                  value={settings.interestPeriod}
                  onChange={(e) => setSettings({ ...settings, interestPeriod: parseInt(e.target.value) || 0 })}
                  className="input-premium w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Min Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.minInterestRate}
                    onChange={(e) => setSettings({ ...settings, minInterestRate: parseFloat(e.target.value) || 0 })}
                    className="input-premium w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Max Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.maxInterestRate}
                    onChange={(e) => setSettings({ ...settings, maxInterestRate: parseFloat(e.target.value) || 0 })}
                    className="input-premium w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Interest Cap ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.interestCap}
                  onChange={(e) => setSettings({ ...settings, interestCap: parseFloat(e.target.value) || 0 })}
                  className="input-premium w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-400" />
                <span>Payment & Reminder Settings</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Reminder Frequency (days)</label>
                <input
                  type="number"
                  value={settings.reminderFrequency}
                  onChange={(e) => setSettings({ ...settings, reminderFrequency: parseInt(e.target.value) || 0 })}
                  className="input-premium w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Overdue Threshold (days)</label>
                <input
                  type="number"
                  value={settings.overdueThreshold}
                  onChange={(e) => setSettings({ ...settings, overdueThreshold: parseInt(e.target.value) || 0 })}
                  className="input-premium w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Grace Period (days)</label>
                <input
                  type="number"
                  value={settings.gracePeriod}
                  onChange={(e) => setSettings({ ...settings, gracePeriod: parseInt(e.target.value) || 0 })}
                  className="input-premium w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Late Fees</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={settings.lateFees}
                    onChange={(e) => setSettings({ ...settings, lateFees: parseFloat(e.target.value) || 0 })}
                    className="input-premium"
                  />
                  <select
                    value={settings.lateFeeType}
                    onChange={(e) => setSettings({ ...settings, lateFeeType: e.target.value })}
                    className="input-premium"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Automation Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Automation Settings</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                  <div>
                    <span className="text-white font-medium">Auto Calculate Interest</span>
                    <p className="text-sm text-zinc-400">Automatically calculate and add interest</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, autoCalculateInterest: !settings.autoCalculateInterest })}
                    className={`p-2 rounded-lg transition-colors ${
                      settings.autoCalculateInterest 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-zinc-500/20 text-zinc-400'
                    }`}
                  >
                    {settings.autoCalculateInterest ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                  <div>
                    <span className="text-white font-medium">Send Reminders</span>
                    <p className="text-sm text-zinc-400">Send payment reminders to customers</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, sendReminders: !settings.sendReminders })}
                    className={`p-2 rounded-lg transition-colors ${
                      settings.sendReminders 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-zinc-500/20 text-zinc-400'
                    }`}
                  >
                    {settings.sendReminders ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                  <div>
                    <span className="text-white font-medium">Auto Mark Overdue</span>
                    <p className="text-sm text-zinc-400">Automatically mark orders as overdue</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, autoMarkOverdue: !settings.autoMarkOverdue })}
                    className={`p-2 rounded-lg transition-colors ${
                      settings.autoMarkOverdue 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-zinc-500/20 text-zinc-400'
                    }`}
                  >
                    {settings.autoMarkOverdue ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                  <div>
                    <span className="text-white font-medium">Email Notifications</span>
                    <p className="text-sm text-zinc-400">Send email notifications</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, sendEmailNotifications: !settings.sendEmailNotifications })}
                    className={`p-2 rounded-lg transition-colors ${
                      settings.sendEmailNotifications 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-zinc-500/20 text-zinc-400'
                    }`}
                  >
                    {settings.sendEmailNotifications ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                  <div>
                    <span className="text-white font-medium">SMS Notifications</span>
                    <p className="text-sm text-zinc-400">Send SMS notifications</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, sendSMSNotifications: !settings.sendSMSNotifications })}
                    className={`p-2 rounded-lg transition-colors ${
                      settings.sendSMSNotifications 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-zinc-500/20 text-zinc-400'
                    }`}
                  >
                    {settings.sendSMSNotifications ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                  <div>
                    <span className="text-white font-medium">Require Approval</span>
                    <p className="text-sm text-zinc-400">Require approval for large financing</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, requireApproval: !settings.requireApproval })}
                    className={`p-2 rounded-lg transition-colors ${
                      settings.requireApproval 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-zinc-500/20 text-zinc-400'
                    }`}
                  >
                    {settings.requireApproval ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>Advanced Settings</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Approval Threshold ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.approvalThreshold}
                  onChange={(e) => setSettings({ ...settings, approvalThreshold: parseFloat(e.target.value) || 0 })}
                  className="input-premium w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Invoice Frequency (days)</label>
                <input
                  type="number"
                  value={settings.invoiceFrequency}
                  onChange={(e) => setSettings({ ...settings, invoiceFrequency: parseInt(e.target.value) || 0 })}
                  className="input-premium w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                  className="input-premium w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancingSettings; 