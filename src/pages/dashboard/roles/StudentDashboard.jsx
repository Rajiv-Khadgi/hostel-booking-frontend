import React, { useMemo } from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import { EnhancedAreaChart, BookingStatusChart } from '../../../components/dashboard/RechartsComponents';
import { ComparisonCard, InsightCard } from '../../../components/dashboard/PerformanceIndicators';
import { FaCalendarCheck, FaWallet, FaHeart, FaEye, FaRegClock, FaLightbulb, FaBullseye } from 'react-icons/fa';

export default function StudentDashboard({ stats }) {
    if (!stats || !stats.metrics || !stats.charts) {
        return <div className="text-center py-12 text-gray-400">Loading dashboard data...</div>;
    }

    const formatChartData = useMemo(() => {
        if (!stats.charts?.spendingTrend) return [];
        return stats.charts.spendingTrend.map(d => ({
            name: new Date(d.month).toLocaleDateString('default', { month: 'short', year: '2-digit' }),
            total: Number(d.total || 0)
        }));
    }, [stats.charts?.spendingTrend]);

    const formatWeeklyData = useMemo(() => {
        if (!stats.charts?.weeklySpending) return [];
        return stats.charts.weeklySpending.map(d => ({
            name: new Date(d.date).toLocaleDateString('default', { month: 'short', day: 'numeric' }),
            total: Number(d.total || 0)
        }));
    }, [stats.charts?.weeklySpending]);

    const bookingStatusData = useMemo(() => {
        if (!stats.charts?.bookingsByStatus) return [];
        return stats.charts.bookingsByStatus.map(item => ({
            status: item.status || 'Unknown',
            count: Number(item.count || 0)
        }));
    }, [stats.charts?.bookingsByStatus]);

    const insightRecommendation = (stats.metrics?.spendingGrowth || 0) > 0
        ? "Your spending has increased this month. Consider setting a monthly budget to manage costs."
        : "Great! You've reduced spending this month compared to last month. Keep it up!";

    const { metrics = {}, charts = {} } = stats;

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    title="Active Bookings"
                    value={metrics.totalBookings || 0}
                    icon={FaCalendarCheck}
                    color="emerald"
                />
                <StatCard
                    title="Total Spent"
                    value={`Rs. ${(metrics.totalSpent || 0).toLocaleString()}`}
                    icon={FaWallet}
                    color="blue"
                    trendValue={metrics.spendingGrowth}
                />
                <StatCard
                    title="Saved Hostels"
                    value={metrics.savedHostels || 0}
                    icon={FaHeart}
                    color="amber"
                />
                <StatCard
                    title="Upcoming Visits"
                    value={metrics.upcomingVisits || 0}
                    icon={FaEye}
                    color="indigo"
                />
                <StatCard
                    title="Pending Visits"
                    value={metrics.pendingVisits || 0}
                    icon={FaRegClock}
                    color="amber"
                />
            </div>

            {/* Main Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Spending Trend - Large Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Spending Behavior</h3>
                        <p className="text-gray-400 font-medium">6-month trend analysis of your hostel expenses</p>
                    </div>
                    <div className="h-[300px]">
                        <EnhancedAreaChart data={formatChartData} color="#3b82f6" dataKey="total" />
                    </div>
                </div>

                {/* Avg Spending per Booking */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-lg overflow-hidden relative group">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 text-indigo-100">
                            <FaBullseye size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Avg per Booking</span>
                        </div>
                        <p className="text-5xl font-black text-white mb-2">Rs. {(metrics.avgPerBooking || 0).toLocaleString()}</p>
                        <div className="h-1 w-20 bg-white/30 rounded-full mt-4" />
                        <p className="text-indigo-100 text-sm mt-4 font-medium">Calculate total spend ÷ bookings</p>
                    </div>
                </div>
            </div>

            {/* Weekly Spending & Booking Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weekly Breakdown */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Weekly Spending</h3>
                        <p className="text-gray-400 font-medium">Last 4 weeks breakdown</p>
                    </div>
                    <div className="h-[250px]">
                        <EnhancedAreaChart data={formatWeeklyData} color="#10b981" dataKey="total" />
                    </div>
                </div>

                {/* Booking Status Distribution */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Booking Status</h3>
                        <p className="text-gray-400 font-medium">Current booking breakdown</p>
                    </div>
                    <div className="h-[250px]">
                        <BookingStatusChart data={bookingStatusData} />
                    </div>
                </div>
            </div>

            {/* Comparison & Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ComparisonCard
                    title="Monthly Spending"
                    current={metrics.totalSpent || 0}
                    previous={Math.max(0, (metrics.totalSpent || 0) - ((metrics.spendingGrowth || 0) * (metrics.totalSpent || 0) / 100))}
                    unit="Rs. "
                    trend={metrics.spendingGrowth || 0}
                />

                <InsightCard
                    title="Smart Insights"
                    description="Spending Pattern Analysis"
                    value={`Rs. ${(metrics.totalSpent || 0).toLocaleString()}`}
                    trend={metrics.spendingGrowth || 0}
                    icon={FaLightbulb}
                    recommendation={insightRecommendation}
                />
            </div>

            {/* Next Visit Reminder */}
            <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2.5rem] flex items-center justify-between">
                <div>
                    <h4 className="text-indigo-900 font-black text-lg">Next Visit Reminder</h4>
                    <p className="text-indigo-700 font-medium italic mt-1">
                        {(metrics.upcomingVisits || 0) > 0
                            ? `You have ${metrics.upcomingVisits} visit${metrics.upcomingVisits > 1 ? 's' : ''} scheduled. Don't forget your ID!`
                            : "No visits scheduled. Ready to explore new hostels?"}
                    </p>
                </div>
                <div className="p-4 bg-white rounded-2xl text-indigo-600 shadow-sm">
                    <FaEye size={24} />
                </div>
            </div>
        </div>
    );
}

