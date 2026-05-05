import React from 'react';
import { FaArrowUp, FaArrowDown, FaFire, FaBullseye, FaChartBar } from 'react-icons/fa';

// Performance Indicator Card
export const PerformanceMetric = ({ label, value, previousValue, unit = '', icon: Icon, status = 'neutral' }) => {
    const change = previousValue ? value - previousValue : 0;
    const changePercent = previousValue ? Math.round((change / previousValue) * 100) : 0;
    const isPositive = change >= 0;

    const statusColors = {
        positive: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        negative: 'text-rose-600 bg-rose-50 border-rose-100',
        neutral: 'text-blue-600 bg-blue-50 border-blue-100'
    };

    const statusClass = isPositive && changePercent !== 0 ? 'positive' : changePercent < 0 ? 'negative' : 'neutral';

    return (
        <div className={`p-6 rounded-2xl border ${statusColors[statusClass]} bg-opacity-50`}>
            <div className="flex items-start justify-between">
                {Icon && (
                    <div className="p-3 rounded-xl bg-white/60 text-current">
                        <Icon size={20} />
                    </div>
                )}
                {changePercent !== 0 && (
                    <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-white/70">
                {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                        <span>{Math.abs(changePercent)}%</span>
                    </div>
                )}
            </div>
            <h4 className="text-sm font-semibold text-gray-600 mt-4 uppercase tracking-wider">{label}</h4>
            <p className="text-3xl font-black text-gray-900 mt-1">
                {value.toLocaleString()}{unit}
            </p>
            {previousValue !== undefined && (
                <p className="text-xs text-gray-500 mt-2">Previous: {previousValue.toLocaleString()}</p>
            )}
        </div>
    );
};

// Comparison Widget
export const ComparisonCard = ({ title, current, previous, unit = '', trend = 0 }) => {
    const isPositive = trend >= 0;

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                    {isPositive ? (
                        <FaArrowUp className={isPositive ? 'text-emerald-600' : 'text-rose-600'} />
                    ) : (
                        <FaArrowDown className={isPositive ? 'text-emerald-600' : 'text-rose-600'} />
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">This Month</p>
                    <p className="text-2xl font-black text-gray-900">
                        {current.toLocaleString()}{unit}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Last Month</p>
                    <p className="text-xl font-bold text-gray-600">
                        {previous.toLocaleString()}{unit}
                    </p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <div className={`p-1.5 rounded-lg ${isPositive ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                        {isPositive ? (
                            <FaFire className="text-emerald-600" size={14} />
                        ) : (
                            <FaChartBar className="text-rose-600" size={14} />
                        )}
                    </div>
                    <span className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? '+' : ''}{trend}%
                    </span>
                    <span className="text-xs text-gray-500">vs last month</span>
                </div>
            </div>
        </div>
    );
};

// Goal Progress Card
export const GoalProgressCard = ({ title, current, target, unit = '', category = 'revenue' }) => {
    const percentage = Math.round((current / target) * 100);
    const isGoalMet = current >= target;

    const categoryColors = {
        revenue: 'from-emerald-500 to-blue-500',
        occupancy: 'from-blue-500 to-indigo-500',
        bookings: 'from-indigo-500 to-purple-500',
        users: 'from-purple-500 to-pink-500'
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">{title}</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isGoalMet ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {isGoalMet ? '✓ Goal Met' : `${percentage}% Towards Goal`}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Current</p>
                        <p className="text-2xl font-black text-gray-900">
                            {current.toLocaleString()}{unit}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Target</p>
                        <p className="text-2xl font-black text-gray-600">
                            {target.toLocaleString()}{unit}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-600">
                        <span>Progress</span>
                        <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-3 rounded-full bg-gradient-to-r ${categoryColors[category]} transition-all duration-500`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                        <span>Remaining: {(target - current).toLocaleString()}{unit}</span>
                        <span className={isGoalMet ? 'text-emerald-600 font-bold' : ''}>
                            {isGoalMet ? 'Completed!' : `${Math.max(0, target - current).toLocaleString()} to go`}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Insight Card with recommendation
export const InsightCard = ({ title, description, value, trend, icon: Icon, recommendation }) => {
    const isPositive = trend >= 0;

    return (
        <div className={`p-6 rounded-2xl border ${isPositive ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100'}`}>
            <div className="flex items-start gap-4">
                {Icon && (
                    <div className={`p-3 rounded-xl ${isPositive ? 'bg-emerald-100/70' : 'bg-amber-100/70'}`}>
                        <Icon className={isPositive ? 'text-emerald-600' : 'text-amber-600'} size={24} />
                    </div>
                )}
                <div className="flex-1">
                    <h3 className={`font-bold text-lg ${isPositive ? 'text-emerald-900' : 'text-amber-900'}`}>{title}</h3>
                    <p className={`text-sm mt-1 ${isPositive ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {description}
                    </p>
                    {recommendation && (
                        <div className={`mt-3 p-3 rounded-lg ${isPositive ? 'bg-emerald-100/50' : 'bg-amber-100/50'}`}>
                            <p className={`text-xs font-semibold ${isPositive ? 'text-emerald-800' : 'text-amber-800'}`}>
                                💡 {recommendation}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Metric Comparison Grid
export const MetricGrid = ({ metrics }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metrics.map((metric, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{metric.label}</p>
                    <div className="flex items-center justify-between">
                        <p className="text-2xl font-black text-gray-900">{metric.value}{metric.unit || ''}</p>
                        {metric.change !== undefined && (
                            <div className={`text-sm font-bold flex items-center gap-1 ${metric.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {metric.change >= 0 ? '↑' : '↓'}{Math.abs(metric.change)}%
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
