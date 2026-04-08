import React, { useMemo } from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import { EnhancedAreaChart, BookingStatusChart, TopPerformersChart, RatingDistributionChart } from '../../../components/dashboard/RechartsComponents';
import { ComparisonCard, InsightCard, MetricGrid } from '../../../components/dashboard/PerformanceIndicators';
import { FaWallet, FaHotel, FaUsers, FaChartLine, FaLightbulb } from 'react-icons/fa';

export default function AdminDashboard({ stats }) {
    if (!stats || !stats.metrics || !stats.charts) {
        return <div className="text-center py-12 text-gray-400">Loading dashboard data...</div>;
    }

    const { metrics = {}, charts = {} } = stats;

    const formatChartData = useMemo(() => {
        if (!charts.growthTrend) return [];
        return charts.growthTrend.map(d => ({
            name: new Date(d.month).toLocaleDateString('default', { month: 'short', year: '2-digit' }),
            total: Number(d.count || 0)
        }));
    }, [charts.growthTrend]);

    const formatBookingData = useMemo(() => {
        if (!charts.bookingTrend) return [];
        return charts.bookingTrend.map(d => ({
            name: new Date(d.month).toLocaleDateString('default', { month: 'short', year: '2-digit' }),
            total: Number(d.count || 0)
        }));
    }, [charts.bookingTrend]);

    const paymentStatusData = useMemo(() => {
        if (!charts.paymentStatus) return [];
        return charts.paymentStatus.map(item => ({
            status: item.status || 'Unknown',
            count: Number(item.count || 0)
        }));
    }, [charts.paymentStatus]);

    const metricsData = useMemo(() => [
        { label: 'Avg Revenue/Hostel', value: `Rs. ${(metrics.avgRevenuePerHostel || 0).toLocaleString()}`, unit: '', change: metrics.revenueGrowth },
        { label: 'Revenue Growth', value: metrics.revenueGrowth || 0, unit: '%', change: undefined },
        { label: 'User Growth', value: metrics.userGrowth || 0, unit: '%', change: undefined },
        { label: 'Total Users', value: ((metrics.totalStudents || 0) + (metrics.totalOwners || 0)).toLocaleString(), unit: '', change: undefined }
    ], [metrics]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Platform Revenue"
                    value={`Rs. ${(metrics.totalRevenue || 0).toLocaleString()}`}
                    icon={FaWallet}
                    color="emerald"
                    trendValue={metrics.revenueGrowth}
                />
                <StatCard
                    title="Total Hostels"
                    value={metrics.totalHostels || 0}
                    icon={FaHotel}
                    color="blue"
                />
                <StatCard
                    title="Students"
                    value={metrics.totalStudents || 0}
                    icon={FaUsers}
                    color="indigo"
                    trendValue={metrics.userGrowth}
                />
                <StatCard
                    title="Asset Owners"
                    value={metrics.totalOwners || 0}
                    icon={FaUsers}
                    color="amber"
                />
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth Trend */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">User Growth Trend</h3>
                        <p className="text-sm text-gray-400 font-medium">6-month user acquisition</p>
                    </div>
                    <div className="h-[280px]">
                        <EnhancedAreaChart data={formatChartData} color="#3b82f6" dataKey="total" />
                    </div>
                </div>

                {/* Booking Trend */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Booking Trend</h3>
                        <p className="text-sm text-gray-400 font-medium">Monthly booking activity</p>
                    </div>
                    <div className="h-[280px]">
                        <EnhancedAreaChart data={formatBookingData} color="#10b981" dataKey="total" />
                    </div>
                </div>
            </div>

            {/* Payment & Rating Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Status */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Payment Status</h3>
                    <div className="h-[280px]">
                        <BookingStatusChart data={paymentStatusData} />
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Hostel Rating Distribution</h3>
                    <div className="h-[280px]">
                        <RatingDistributionChart data={charts.hostelRatingDistribution || []} />
                    </div>
                </div>
            </div>

            {/* Top Hostels by Revenue */}
            {charts.topHostels && charts.topHostels.length > 0 && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Top Performing Hostels</h3>
                    <TopPerformersChart data={charts.topHostels} />
                </div>
            )}

            {/* Key Metrics Grid */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6">Platform Metrics</h3>
                <MetricGrid metrics={metricsData} />
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ComparisonCard
                    title="Revenue Growth"
                    current={Math.max(0, Math.round((metrics.totalRevenue || 0) * (metrics.revenueGrowth || 0) / 100))}
                    previous={Math.max(0, Math.round((metrics.totalRevenue || 0) / (1 + (metrics.revenueGrowth || 0) / 100)))}
                    unit="Rs. "
                    trend={metrics.revenueGrowth || 0}
                />

                <ComparisonCard
                    title="User Growth"
                    current={Math.max(0, Math.round(((metrics.totalStudents || 0) + (metrics.totalOwners || 0)) * (1 + (metrics.userGrowth || 0) / 100)))}
                    previous={(metrics.totalStudents || 0) + (metrics.totalOwners || 0)}
                    unit=" users"
                    trend={metrics.userGrowth || 0}
                />
            </div>

            {/* System Health & Insights */}
            <InsightCard
                title="Platform Health"
                description="Real-time System Status"
                value="Optimal"
                trend={metrics.revenueGrowth || 0}
                icon={FaChartLine}
                recommendation={`Platform is growing well with ${metrics.userGrowth || 0}% user growth and ${metrics.revenueGrowth || 0}% revenue growth. Focus on hostels with low ratings to improve overall platform quality.`}
            />
        </div>
    );
}