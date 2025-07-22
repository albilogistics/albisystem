import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MetricCard = ({ icon: Icon, value, label, diff, color = 'blue', description, trend }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      gradient: 'from-blue-500/20 to-blue-600/20'
    },
    green: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30',
      gradient: 'from-green-500/20 to-green-600/20'
    },
    red: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      gradient: 'from-red-500/20 to-red-600/20'
    },
    purple: {
      bg: 'bg-purple-500/20',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      gradient: 'from-purple-500/20 to-purple-600/20'
    },
    yellow: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      gradient: 'from-yellow-500/20 to-yellow-600/20'
    },
    orange: {
      bg: 'bg-orange-500/20',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      gradient: 'from-orange-500/20 to-orange-600/20'
    }
  };

  const diffColorClasses = {
    blue: 'bg-blue-500/20 text-blue-300 border-blue-800/50',
    green: 'bg-green-500/20 text-green-300 border-green-800/50',
    red: 'bg-red-500/20 text-red-300 border-red-800/50',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-800/50',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-800/50',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-800/50'
  };

  const currentColor = colorClasses[color];

  return (
    <div className={`premium-card p-6 relative overflow-hidden group`}>
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentColor.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={`w-14 h-14 ${currentColor.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-7 h-7 ${currentColor.text}`} />
          </div>
          
          {diff && (
            <div className={`px-4 py-2 rounded-xl text-sm font-medium border ${diffColorClasses[color]} flex items-center space-x-1`}>
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>{diff > 0 ? '+' : ''}{diff}%</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
            {value}
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-white">{label}</div>
            {description && (
              <div className="text-sm text-zinc-400">{description}</div>
            )}
          </div>
        </div>

        {/* Hover effect indicator */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
             style={{ color: currentColor.text.replace('text-', '') }}>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
        <div className="w-2 h-2 bg-current rounded-full absolute top-4 right-4 animate-pulse"
             style={{ color: currentColor.text.replace('text-', '') }}></div>
        <div className="w-1 h-1 bg-current rounded-full absolute top-8 right-8 animate-pulse delay-100"
             style={{ color: currentColor.text.replace('text-', '') }}></div>
        <div className="w-1.5 h-1.5 bg-current rounded-full absolute top-12 right-12 animate-pulse delay-200"
             style={{ color: currentColor.text.replace('text-', '') }}></div>
      </div>
    </div>
  );
};

export default MetricCard; 