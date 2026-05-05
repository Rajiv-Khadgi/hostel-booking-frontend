import React from 'react';

const StatCard = ({ title, value, icon: Icon, trendValue, color = 'emerald' }) => {
    const isPositive = trendValue >= 0;
    
    const colors = {
        emerald: {
            bg: 'bg-emerald-50/50',
            text: 'text-emerald-600',
            border: 'border-emerald-100',
            icon: 'bg-emerald-100/80 text-emerald-600'
        },
        blue: {
            bg: 'bg-blue-50/50',
            text: 'text-blue-600',
            border: 'border-blue-100',
            icon: 'bg-blue-100/80 text-blue-600'
        },
        amber: {
            bg: 'bg-amber-50/50',
            text: 'text-amber-600',
            border: 'border-amber-100',
            icon: 'bg-amber-100/80 text-amber-600'
        },
        indigo: {
            bg: 'bg-indigo-50/50',
            text: 'text-indigo-600',
            border: 'border-indigo-100',
            icon: 'bg-indigo-100/80 text-indigo-600'
        },
    };

    const theme = colors[color] || colors.emerald;

    return (
        <div 
            className={`group relative overflow-hidden bg-white p-6 rounded-[2rem] border ${theme.border} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
            role="region"
            aria-label={`${title}: ${value}`}
        >
            <div className="flex items-start justify-between">
                <div className={`p-4 rounded-2xl ${theme.icon} transition-colors duration-300`}>
                    <Icon size={24} aria-hidden="true" />
                </div>
                {trendValue !== undefined && (
                    <div 
                        className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}
                        title={isPositive ? "Increased from last month" : "Decreased from last month"}
                    >
                        <span>{isPositive ? '↑' : '↓'}</span>
                        <span>{Math.abs(trendValue)}%</span>
                    </div>
                )}
            </div>
            
            <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
                </div>
            </div>

            {/* Subtle background decoration */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${theme.bg} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </div>
    );
};

export default StatCard;
