import React, { useMemo } from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import { EnhancedAreaChart, RevenueBreakdownChart, BookingStatusChart, PerformanceRadarChart, TopPerformersChart } from '../../../components/dashboard/RechartsComponents';
import { ComparisonCard, GoalProgressCard, InsightCard, PerformanceMetric } from '../../../components/dashboard/PerformanceIndicators';
import { FaWallet, FaChartLine, FaCalendarCheck, FaRegClock, FaHeart, FaLightbulb, FaFire } from 'react-icons/fa';

export default function OwnerDashboard({ stats }) {
    if (!stats || !stats.metrics || !stats.charts) {
        return <div className="text-center py-12 text-gray-400">Loading dashboard data...</div>;
    }

    const { metrics = {}, charts = {} } = stats;

    const formatChartData = useMemo(() => {
        if (!charts.revenueTrend) return [];
        return charts.revenueTrend.map(d => ({
            name: new Date(d.month).toLocaleDateString('default', { month: 'short', year: '2-digit' }),
            total: Number(d.total || 0)
        }));
    }, [charts.revenueTrend]);

    const bookingStatusData = useMemo(() => {
        if (!charts.bookingStatus) return [];
        return charts.bookingStatus.map(item => ({
            status: item.status || 'Unknown',
            count: Number(item.count || 0)
        }));
    }, [charts.bookingStatus]);

    const topRoomsData = useMemo(() => {
        if (!charts.revenueByRoom) return [];
        return charts.revenueByRoom.map((item, idx) => ({
            name: item['room.room_type'] || `Room Type ${idx + 1}`,
            total: Number(item.total || 0)
        }));
    }, [charts.revenueByRoom]);

    const insightMessage = (metrics.occupancyRate || 0) > 80
        ? "Your occupancy is excellent! Consider premium pricing for peak seasons."
        : (metrics.occupancyRate || 0) > 50
            ? "Good occupancy rate. Try offering special discounts mid-week to boost it further."
            : "Low occupancy. Consider marketing campaigns or dynamic pricing strategies.";

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Earnings"
                    value={`Rs. ${(metrics.totalEarnings || 0).toLocaleString()}`}
                    icon={FaWallet}
                    color="emerald"
                    trendValue={metrics.revenueGrowth}
                />
                <StatCard
                    title="Occupancy Rate"
                    value={`${metrics.occupancyRate || 0}%`}
                    icon={FaChartLine}
                    color="blue"
                />
                <StatCard
                    title="Active Bookings"
                    value={metrics.activeBookings || 0}
                    icon={FaCalendarCheck}
                    color="indigo"
                />
                <StatCard
                    title="Pending Requests"
                    value={metrics.pendingRequests || 0}
                    icon={FaRegClock}
                    color="amber"
                />
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Analysis */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Revenue Analysis</h3>
                        <p className="text-sm text-gray-400 font-medium">Monthly performance (Last 6 months)</p>
                    </div>
                    <div className="h-[300px]">
                        <EnhancedAreaChart data={formatChartData} color="#10b981" dataKey="total" />
                    </div>
                </div>

                {/* Performance Radar */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Performance Metrics</h3>
                    <div className="h-[300px]">
                        <PerformanceRadarChart data={metrics} />
                    </div>
                </div>
            </div>

            {/* Revenue & Booking Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue by Room Type */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Revenue by Room Type</h3>
                    <div className="h-[300px]">
                        <RevenueBreakdownChart data={charts.revenueByRoom || []} />
                    </div>
                </div>

                {/* Booking Status */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Booking Status</h3>
                    <div className="h-[300px]">
                        <BookingStatusChart data={bookingStatusData} />
                    </div>
                </div>
            </div>

            {/* Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <PerformanceMetric
                    label="Booking Conversion"
                    value={metrics.conversionRate || 0}
                    unit="%"
                    icon={FaFire}
                />
                <ComparisonCard
                    title="Revenue Growth"
                    current={Math.max(0, Math.round((metrics.totalEarnings || 0) * (metrics.revenueGrowth || 0) / 100))}
                    previous={Math.max(0, Math.round((metrics.totalEarnings || 0) / (1 + (metrics.revenueGrowth || 0) / 100)))}
                    unit="Rs. "
                    trend={metrics.revenueGrowth || 0}
                />
            </div>

            {/* Room Statistics */}
            {topRoomsData.length > 0 && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6">Top Performing Room Types</h3>
                    <TopPerformersChart data={topRoomsData} />
                </div>
            )}

            {/* Goal Progress & Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GoalProgressCard
                    title="Occupancy Goal"
                    current={metrics.occupancyRate || 0}
                    target={85}
                    unit="%"
                    category="occupancy"
                />

                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-lg overflow-hidden relative group">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 text-indigo-100">
                            <FaHeart size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Average Rating</span>
                        </div>
                        <p className="text-5xl font-black text-white mb-2">{(metrics.averageRating || 0).toFixed(1)}</p>
                        <div className="flex gap-1 mt-4">
                            {[...Array(5)].map((_, i) => (
                                <FaHeart
                                    key={i}
                                    className={i < Math.round(metrics.averageRating || 0) ? 'text-white' : 'text-white/30'}
                                    size={16}
                                />
                            ))}
                        </div>
                        <p className="text-indigo-100 text-sm mt-4 font-medium">Based on guest reviews</p>
                    </div>
                </div>
            </div>

            {/* Smart Insights */}
            <InsightCard
                title="Occupancy Intelligence"
                description="AI-Powered Recommendations"
                value={`${metrics.occupancyRate || 0}% Occupancy`}
                trend={metrics.revenueGrowth || 0}
                icon={FaLightbulb}
                recommendation={insightMessage}
            />
        </div>
    );
}