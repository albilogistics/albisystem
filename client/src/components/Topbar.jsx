import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  HelpCircle, 
  Moon,
  Sun,
  Sparkles,
  AlertTriangle,
  X
} from 'lucide-react';
import CartBadge from './CartBadge';

const Topbar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    // Show custom confirmation dialog
    setShowLogoutConfirm(true);
    setShowUserMenu(false);
  };

  const confirmLogout = () => {
    // Clear ALL authentication data from admin dashboard
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Also clear client-portal auth token to prevent auto-redirect
    localStorage.removeItem('authToken');
    // Clear any other potential auth tokens
    localStorage.removeItem('userToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear(); // Clear session storage too
    
    // Close the confirmation dialog
    setShowLogoutConfirm(false);
    
    // Force a complete page reload to clear any cached state
    setTimeout(() => {
      // First redirect to a logout page that clears everything
      window.location.href = 'http://localhost:4000/logout';
    }, 100);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const notifications = [
    { id: 1, message: 'Price sync completed successfully', time: '2 min ago', type: 'success' },
    { id: 2, message: 'New inventory items added', time: '5 min ago', type: 'info' },
    { id: 3, message: 'System maintenance scheduled', time: '1 hour ago', type: 'warning' },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500/20';
      case 'warning': return 'bg-yellow-500/20';
      case 'error': return 'bg-red-500/20';
      default: return 'bg-blue-500/20';
    }
  };

  return (
    <div className="h-16 bg-black/95 backdrop-blur-xl border-b border-zinc-800/30 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Left Section - Logo */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Albi Logistics</span>
            <p className="text-xs text-zinc-500 -mt-1">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-lg mx-12">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-400 transition-colors duration-200" />
          <input
            type="text"
            placeholder="Search orders, customers, invoices..."
            className="w-full pl-12 pr-6 py-3 bg-zinc-900/50 text-white rounded-2xl border border-zinc-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 backdrop-blur-sm transition-all duration-300 placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* Cart Badge */}
        <CartBadge />
        
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-800/30 rounded-2xl transition-all duration-200 group"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          ) : (
            <Moon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-2xl transition-all duration-200 group"
          >
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 shadow-2xl rounded-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-zinc-700/80">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                <p className="text-zinc-400 text-sm">You have {notifications.length} new notifications</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-zinc-800/80 transition-colors duration-200 border-b border-zinc-700/80 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 ${getNotificationBg(notification.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Bell className={`w-4 h-4 ${getNotificationIcon(notification.type)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{notification.message}</p>
                        <p className="text-xs text-zinc-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-zinc-700/80">
                <button className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-zinc-800/80 transition-all duration-200 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white">Jean Paul</p>
              <p className="text-xs text-zinc-400">Administrator</p>
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 shadow-2xl rounded-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-zinc-700/80">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Jean Paul</p>
                    <p className="text-xs text-zinc-400">jean.paul@assurant.com</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <Link to="/dashboard/account" className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors duration-200">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link to="/dashboard/admin" className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors duration-200">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors duration-200">
                  <HelpCircle className="w-4 h-4" />
                  <span>Help & Support</span>
                </button>
              </div>
              
              <div className="p-2 border-t border-zinc-700/80">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={cancelLogout}
        >
          <div 
            className="premium-card p-6 max-w-md w-full mx-4 border border-zinc-700/50 shadow-2xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Sign Out</h3>
                <p className="text-zinc-400 text-sm">Are you sure you want to sign out?</p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors duration-200 border border-zinc-700/50"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </div>
  );
};

export default Topbar; 