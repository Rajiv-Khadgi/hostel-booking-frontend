import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'emerald' }) => {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${colors[color]} border`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`text-xs font-bold px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {trend === 'up' ? '↑' : '↓'} {trendValue}%
                    </div>
                )}
            </div>
            <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
