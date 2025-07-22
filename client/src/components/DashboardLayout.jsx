import React from 'react';
import { Home, Package, DollarSign, Settings, Bell, User } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Dashboard' },
  { icon: Package, label: 'Products' },
  { icon: DollarSign, label: 'Pricing' },
  { icon: Settings, label: 'Settings' }
];

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-20 bg-zinc-900 flex flex-col items-center py-6 space-y-8 border-r border-zinc-800">
        <div className="mb-8">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold text-white">A</span>
          </div>
        </div>
        <nav className="flex flex-col space-y-6 flex-1">
          {navItems.map((item, idx) => (
            <button 
              key={item.label} 
              className="flex flex-col items-center text-zinc-400 hover:text-blue-400 hover:bg-blue-500/20 p-2 rounded-xl transition-all duration-200 focus:outline-none"
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto mb-2">
          <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
            <User className="w-5 h-5 text-zinc-400" />
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-8 bg-zinc-900 border-b border-zinc-800">
          <div className="text-lg font-semibold tracking-wide text-white">Assurant Pricing Dashboard</div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all duration-200">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full"></span>
            </button>
            <span className="font-medium text-white">Jean Paul</span>
            <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
        </header>
        
        {/* Main dashboard content */}
        <main className="flex-1 bg-black overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 