import React from 'react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700">
                <p className="text-sm font-semibold">{payload[0]?.name}</p>
                <p className="text-emerald-400 font-bold">{payload[0]?.value?.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

// Interactive Area Chart with multiple metrics
export const EnhancedAreaChart = ({ data, title = "Trend Analysis", color = '#10b981', dataKey = 'total' }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey={dataKey} stroke={color} fillOpacity={1} fill="url(#colorGradient)" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

// Stacked Bar Chart for multiple data series
export const BookingStatusChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="status" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

// Revenue Breakdown Pie Chart
export const RevenueBreakdownChart = ({ data }) => {
    const transformedData = data.map((item, idx) => ({
        name: item.room_type || item.name || item['room.room_type'] || `Category ${idx}`,
        value: Number(item.total || 0)
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={transformedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                >
                    {transformedData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

// Radar Chart for multi-dimensional comparison
export const PerformanceRadarChart = ({ data }) => {
    const radarData = [
        { category: 'Revenue', value: data.totalEarnings ? Math.min(100, Math.round((data.totalEarnings / 100000) * 100)) : 0 },
        { category: 'Occupancy', value: data.occupancyRate || 0 },
        { category: 'Rating', value: (data.averageRating || 0) * 20 },
        { category: 'Bookings', value: Math.min(100, (data.activeBookings || 0) * 10) },
        { category: 'Conversion', value: data.conversionRate || 0 }
    ];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="category" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                <Radar name="Performance" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </RadarChart>
        </ResponsiveContainer>
    );
};

// Composed Chart with bars and line
export const ComposedMetricsChart = ({ data, bar = 'bookings', line = 'revenue' }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey={bar} fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Line type="monotone" dataKey={line} stroke="#10b981" strokeWidth={2} />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

// Top Performers List Chart
export const TopPerformersChart = ({ data, title = "Top Performers" }) => {
    const maxValue = Math.max(...data.map(d => Number(d.total || 0)), 1);

    return (
        <div className="space-y-4">
            {data.map((item, idx) => (
                <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-gray-700">{item.name || `Item ${idx + 1}`}</span>
                        <span className="font-bold text-gray-900">Rs. {Number(item.total || 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(Number(item.total || 0) / maxValue) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

// Hostel Occupancy Distribution Chart
export const OccupancyDistributionChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ left: 30, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#9ca3af" 
                    width={100}
                    style={{ fontSize: '12px', fontWeight: 'bold' }} 
                />
                <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    content={({ active, payload }) => {
                        if (active && payload?.length) {
                            const d = payload[0].payload;
                            return (
                                <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700">
                                    <p className="text-sm font-semibold mb-1">{d.name}</p>
                                    <div className="flex flex-col gap-1 text-xs">
                                        <p className="text-emerald-400 font-bold">{d.occupancy}% Occupied</p>
                                        <p className="text-gray-400">{d.occupied} / {d.total} Beds</p>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar 
                    dataKey="occupancy" 
                    fill="#3b82f6" 
                    radius={[0, 8, 8, 0]} 
                    barSize={32}
                >
                    {data.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={entry.occupancy > 80 ? '#10b981' : entry.occupancy > 50 ? '#3b82f6' : '#f59e0b'} 
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

// Rating Distribution
export const RatingDistributionChart = ({ data }) => {
    const chartData = data.map(item => ({
        rating: `${item.rating}★`,
        count: Number(item.count || 0)
    }));

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="rating" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};
