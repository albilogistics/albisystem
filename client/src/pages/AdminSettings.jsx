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
  Key,
  User,
  Database as DatabaseIcon
} from 'lucide-react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });
  
  const [settings, setSettings] = useState({
    general: {
              companyName: 'AlbiSystem',
      timezone: 'UTC-5',
      language: 'English',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12-hour'
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      loginAttempts: 5,
      ipWhitelist: false,
      auditLogging: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      priceAlerts: true,
      systemUpdates: false,
      syncNotifications: true,
      errorAlerts: true
    },
    appearance: {
      theme: 'dark',
      accentColor: 'blue',
      fontSize: 'medium',
      animations: true,
      compactMode: false
    },
    system: {
      autoSync: true,
      syncInterval: 30,
      backupEnabled: true,
      backupFrequency: 'daily',
      dataRetention: 90,
      debugMode: false
    }
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'system', label: 'System', icon: DatabaseIcon }
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus({ type: '', message: '' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage for now (in real app, this would be an API call)
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      
      setSaveStatus({ 
        type: 'success', 
        message: 'Settings saved successfully!' 
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ type: '', message: '' });
      }, 3000);
      
    } catch (error) {
      setSaveStatus({ 
        type: 'error', 
        message: 'Failed to save settings. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      const defaultSettings = {
        general: {
          companyName: 'AlbiSystem',
          timezone: 'UTC-5',
          language: 'English',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12-hour'
        },
        security: {
          twoFactorAuth: true,
          sessionTimeout: 30,
          passwordPolicy: 'strong',
          loginAttempts: 5,
          ipWhitelist: false,
          auditLogging: true
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          priceAlerts: true,
          systemUpdates: false,
          syncNotifications: true,
          errorAlerts: true
        },
        appearance: {
          theme: 'dark',
          accentColor: 'blue',
          fontSize: 'medium',
          animations: true,
          compactMode: false
        },
        system: {
          autoSync: true,
          syncInterval: 30,
          backupEnabled: true,
          backupFrequency: 'daily',
          dataRetention: 90,
          debugMode: false
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
    const savedSettings = localStorage.getItem('adminSettings');
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
              <h1 className="text-2xl font-bold gradient-text">Admin Settings</h1>
              <p className="text-zinc-400 text-sm">Configure system preferences and security</p>
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
        {/* Status Message */}
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
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="premium-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={settings.general.companyName}
                      onChange={(e) => handleSettingChange('general', 'companyName', e.target.value)}
                      className="input-premium w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Timezone</label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="UTC-5">Eastern Time (UTC-5)</option>
                      <option value="UTC-6">Central Time (UTC-6)</option>
                      <option value="UTC-7">Mountain Time (UTC-7)</option>
                      <option value="UTC-8">Pacific Time (UTC-8)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Language</label>
                    <select
                      value={settings.general.language}
                      onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Currency</label>
                    <select
                      value={settings.general.currency}
                      onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Date Format</label>
                    <select
                      value={settings.general.dateFormat}
                      onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Time Format</label>
                    <select
                      value={settings.general.timeFormat}
                      onChange={(e) => handleSettingChange('general', 'timeFormat', e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="12-hour">12-hour</option>
                      <option value="24-hour">24-hour</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="premium-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                      <p className="text-zinc-400 text-sm">Require 2FA for all users</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="input-premium w-full"
                      min="5"
                      max="120"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Password Policy</label>
                    <select
                      value={settings.security.passwordPolicy}
                      onChange={(e) => handleSettingChange('security', 'passwordPolicy', e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="basic">Basic (8 characters)</option>
                      <option value="strong">Strong (12 characters, symbols)</option>
                      <option value="very-strong">Very Strong (16 characters, symbols, numbers)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      value={settings.security.loginAttempts}
                      onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
                      className="input-premium w-full"
                      min="3"
                      max="10"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">IP Whitelist</h4>
                      <p className="text-zinc-400 text-sm">Restrict access to specific IP addresses</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.ipWhitelist}
                        onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Audit Logging</h4>
                      <p className="text-zinc-400 text-sm">Log all user actions for security</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.auditLogging}
                        onChange={(e) => handleSettingChange('security', 'auditLogging', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="premium-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Email Notifications</h4>
                      <p className="text-zinc-400 text-sm">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Push Notifications</h4>
                      <p className="text-zinc-400 text-sm">Receive browser notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Price Alerts</h4>
                      <p className="text-zinc-400 text-sm">Get notified of price changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.priceAlerts}
                        onChange={(e) => handleSettingChange('notifications', 'priceAlerts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">System Updates</h4>
                      <p className="text-zinc-400 text-sm">Receive system update notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.systemUpdates}
                        onChange={(e) => handleSettingChange('notifications', 'systemUpdates', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Sync Notifications</h4>
                      <p className="text-zinc-400 text-sm">Get notified when data syncs complete</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.syncNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'syncNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Error Alerts</h4>
                      <p className="text-zinc-400 text-sm">Get notified of system errors</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.errorAlerts}
                        onChange={(e) => handleSettingChange('notifications', 'errorAlerts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="premium-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Appearance Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Theme</label>
                    <select
                      value={settings.appearance.theme}
                      onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Accent Color</label>
                    <select
                      value={settings.appearance.accentColor}
                      onChange={(e) => handleSettingChange('appearance', 'accentColor', e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="purple">Purple</option>
                      <option value="orange">Orange</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Font Size</label>
                    <select
                      value={settings.appearance.fontSize}
                      onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Animations</h4>
                      <p className="text-zinc-400 text-sm">Enable smooth animations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.appearance.animations}
                        onChange={(e) => handleSettingChange('appearance', 'animations', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Compact Mode</h4>
                      <p className="text-zinc-400 text-sm">Reduce spacing for more content</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.appearance.compactMode}
                        onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="premium-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">System Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Auto Sync</h4>
                      <p className="text-zinc-400 text-sm">Automatically sync data periodically</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.system.autoSync}
                        onChange={(e) => handleSettingChange('system', 'autoSync', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Sync Interval (minutes)</label>
                    <input
                      type="number"
                      value={settings.system.syncInterval}
                      onChange={(e) => handleSettingChange('system', 'syncInterval', parseInt(e.target.value))}
                      className="input-premium w-full"
                      min="5"
                      max="1440"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Backup Enabled</h4>
                      <p className="text-zinc-400 text-sm">Automatically backup data</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.system.backupEnabled}
                        onChange={(e) => handleSettingChange('system', 'backupEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Backup Frequency</label>
                    <select
                      value={settings.system.backupFrequency}
                      onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Data Retention (days)</label>
                    <input
                      type="number"
                      value={settings.system.dataRetention}
                      onChange={(e) => handleSettingChange('system', 'dataRetention', parseInt(e.target.value))}
                      className="input-premium w-full"
                      min="7"
                      max="365"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Debug Mode</h4>
                      <p className="text-zinc-400 text-sm">Enable detailed logging for troubleshooting</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.system.debugMode}
                        onChange={(e) => handleSettingChange('system', 'debugMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
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

export default AdminSettings; 