import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import StatCard from '../../components/dashboard/StatCard';
import { RevenueLineChart, RoomTypePieChart } from '../../components/dashboard/AnalyticsCharts';
import { 
    FaCalendarCheck, 
    FaWallet, 
    FaHeart, 
    FaEye, 
    FaUsers, 
    FaHotel, 
    FaChartLine,
    FaRegClock
} from 'react-icons/fa';

export default function Overview() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/dashboard/stats');
            setStats(res.data.stats);
        } catch (err) {
            setError('Failed to load dashboard statistics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!stats) return null;

    const renderStudentDashboard = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Active Bookings" 
                    value={stats.metrics.totalBookings} 
                    icon={FaCalendarCheck} 
                    color="emerald" 
                />
                <StatCard 
                    title="Total Spent" 
                    value={`Rs. ${stats.metrics.totalSpent.toLocaleString()}`} 
                    icon={FaWallet} 
                    color="blue" 
                />
                <StatCard 
                    title="Saved Hostels" 
                    value={stats.metrics.savedHostels} 
                    icon={FaHeart} 
                    color="amber" 
                />
                <StatCard 
                    title="Upcoming Visits" 
                    value={stats.metrics.upcomingVisits} 
                    icon={FaEye} 
                    color="indigo" 
                />
                <StatCard 
                    title="Pending Visits" 
                    value={stats.metrics.pendingVisits} 
                    icon={FaRegClock} 
                    color="amber" 
                />
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Spending Trend</h3>
                <div className="h-64">
                    <RevenueLineChart data={stats.charts.spendingTrend} />
                </div>
            </div>
        </div>
    );

    const renderOwnerDashboard = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Earnings" 
                    value={`Rs. ${stats.metrics.totalEarnings.toLocaleString()}`} 
                    icon={FaWallet} 
                    color="emerald" 
                    trend="up" 
                    trendValue="12" 
                />
                <StatCard 
                    title="Occupancy Rate" 
                    value={`${stats.metrics.occupancyRate}%`} 
                    icon={FaChartLine} 
                    color="blue" 
                />
                <StatCard 
                    title="Active Bookings" 
                    value={stats.metrics.activeBookings} 
                    icon={FaCalendarCheck} 
                    color="indigo" 
                />
                <StatCard 
                    title="Pending Requests" 
                    value={stats.metrics.pendingRequests} 
                    icon={FaRegClock} 
                    color="amber" 
                />
                <StatCard 
                    title="Average Rating" 
                    value={`${stats.metrics.averageRating} / 5`} 
                    icon={FaHeart} 
                    color="indigo" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue Growth (NPR)</h3>
                    <div className="h-64">
                        <RevenueLineChart data={stats.charts.revenueTrend} />
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Room Distribution</h3>
                    <div className="h-64">
                        <RoomTypePieChart data={stats.charts.roomTypeDistribution} />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAdminDashboard = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={`Rs. ${stats.metrics.totalRevenue.toLocaleString()}`} 
                    icon={FaWallet} 
                    color="emerald" 
                />
                <StatCard 
                    title="Total Hostels" 
                    value={stats.metrics.totalHostels} 
                    icon={FaHotel} 
                    color="blue" 
                />
                <StatCard 
                    title="Total Students" 
                    value={stats.metrics.totalStudents} 
                    icon={FaUsers} 
                    color="indigo" 
                />
                <StatCard 
                    title="Total Owners" 
                    value={stats.metrics.totalOwners} 
                    icon={FaUsers} 
                    color="amber" 
                />
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Platform User Growth</h3>
                <div className="h-64">
                    <RevenueLineChart data={stats.charts.growthTrend} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Welcome back, <span className="text-emerald-600">{user?.first_name}</span>!
                </h1>
                <p className="text-gray-500 mt-2 text-lg">
                    Here's what is happening with your account today.
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                    {error}
                </div>
            )}

            {user?.role === 'student' && renderStudentDashboard()}
            {user?.role === 'owner' && renderOwnerDashboard()}
            {user?.role === 'admin' && renderAdminDashboard()}
        </div>
    );
}
