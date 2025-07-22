import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  DollarSign, 
  Package, 
  Users, 
  Settings, 
  BarChart3, 
  History,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ShoppingCart,
  FileText,
  CreditCard,
  Truck,
  Globe,
  Activity,
  Target,
  Eye,
  Calendar,
  Building,
  Phone,
  Mail,
  Plus,
  Database
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    sales: true,
    orders: true,
    management: true,
    system: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuSections = [
    {
      section: 'dashboard',
      title: 'Dashboard',
      icon: Home,
      items: [
        { path: '/dashboard', icon: Home, label: 'Overview', description: 'Main Dashboard' },
        { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics', description: 'Data Insights' },
        { path: '/dashboard/activity', icon: Activity, label: 'Activity', description: 'Recent Activity' }
      ]
    },
    {
      section: 'sales',
      title: 'Sales & Pricing',
      icon: DollarSign,
      items: [
        { path: '/dashboard/prices', icon: DollarSign, label: 'Prices', description: 'Pricing Management' },
        { path: '/dashboard/costs', icon: Package, label: 'Costs', description: 'Cost Analysis' },
        { path: '/dashboard/market-settings', icon: Globe, label: 'Market Settings', description: 'Pricing & Margins' },
        { path: '/dashboard/targets', icon: Target, label: 'Target Analysis', description: 'Performance Goals' }
      ]
    },
    {
      section: 'orders',
      title: 'Orders & Invoices',
      icon: ShoppingCart,
      items: [
        { path: '/dashboard/orders', icon: Package, label: 'Orders', description: 'Order Management' },
        { path: '/dashboard/invoices', icon: FileText, label: 'Invoices', description: 'Invoice Management' },
        { path: '/dashboard/invoice-builder', icon: FileText, label: 'Invoice Builder', description: 'Create Invoices' },
        { path: '/dashboard/checkout', icon: CreditCard, label: 'Checkout', description: 'Order Processing' },
        { path: '/dashboard/financing', icon: CreditCard, label: 'Financing', description: 'Financing Management' },
        { path: '/dashboard/shipping', icon: Truck, label: 'Shipping', description: 'Delivery Tracking' }
      ]
    },
    {
      section: 'management',
      title: 'Management',
      icon: Users,
      items: [
        { path: '/dashboard/customers', icon: Building, label: 'Customers', description: 'Customer Database' },
        { path: '/dashboard/agents', icon: Users, label: 'Agents', description: 'Team Management' },
        { path: '/dashboard/roles', icon: Eye, label: 'Roles', description: 'Permission Management' },
        { path: '/dashboard/admin-settings', icon: Settings, label: 'Admin Settings', description: 'System Config' }
      ]
    },
    {
      section: 'system',
      title: 'System',
      icon: Settings,
      items: [
        { path: '/dashboard/account', icon: Users, label: 'Account Details', description: 'Profile Settings' },
        { path: '/dashboard/database', icon: Database, label: 'Database', description: 'Data Management' },
        { path: '/dashboard/test-api', icon: BarChart3, label: 'Test API', description: 'API Testing' },
        { path: '/dashboard/calendar', icon: Calendar, label: 'Calendar', description: 'Schedule Management' }
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-black border-r border-zinc-800/50 h-screen flex flex-col">
      {/* Premium Header */}
      <div className="p-6 border-b border-zinc-800/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black pulse-glow"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Assurant</h1>
            <p className="text-xs text-zinc-400">Pricing Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuSections.map((section) => {
          const SectionIcon = section.icon;
          const isExpanded = expandedSections[section.section];

          return (
            <div key={section.section} className="space-y-1">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.section)}
                className="group relative w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 premium-card-hover"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-zinc-800/50 text-zinc-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all duration-300">
                    <SectionIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-zinc-300 group-hover:text-white transition-colors duration-300">
                    {section.title}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-blue-400 transition-colors duration-300" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-400 transition-colors duration-300" />
                )}
              </button>

              {/* Section Items */}
              {isExpanded && (
                <div className="ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    const isHovered = hoveredItem === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onMouseEnter={() => setHoveredItem(item.path)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`group relative block p-3 rounded-xl transition-all duration-300 ${
                          active 
                            ? 'premium-card bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-500/30' 
                            : 'premium-card-hover'
                        }`}
                      >
                        {/* Hover effect overlay */}
                        {isHovered && !active && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl animate-pulse"></div>
                        )}

                        <div className="relative flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                            active 
                              ? 'bg-blue-500/30 text-blue-400' 
                              : 'bg-zinc-800/50 text-zinc-400 group-hover:bg-blue-500/20 group-hover:text-blue-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium transition-colors duration-300 ${
                                active ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                              }`}>
                                {item.label}
                              </span>
                              {active && (
                                <ChevronRight className="w-3 h-3 text-blue-400 animate-pulse" />
                              )}
                            </div>
                            <p className={`text-xs transition-colors duration-300 ${
                              active ? 'text-blue-300' : 'text-zinc-500 group-hover:text-zinc-400'
                            }`}>
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Active indicator */}
                        {active && (
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-full"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-zinc-800/50">
        <h3 className="text-sm font-medium text-zinc-500 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <FileText className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <Mail className="w-4 h-4" />
            <span>Send Reports</span>
          </button>
        </div>
      </div>

      {/* Premium Footer */}
      <div className="p-4 border-t border-zinc-800/50">
        <div className="premium-card p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">System Status</p>
              <p className="text-xs text-green-400">All Systems Operational</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">API Health</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400">Online</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Database</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 