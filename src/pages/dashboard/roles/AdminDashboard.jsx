import React from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import { RevenueAreaChart, UserGrowthBarChart } from '../../../components/dashboard/AnalyticsCharts';
import { FaWallet, FaHotel, FaUsers, FaChartLine } from 'react-icons/fa';

export default function AdminDashboard({ stats }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Platform Revenue" 
                    value={`Rs. ${stats.metrics.totalRevenue.toLocaleString()}`} 
                    icon={FaWallet} 
                    color="emerald" 
                    trendValue={stats.metrics.revenueGrowth}
                />
                <StatCard 
                    title="Total Hostels" 
                    value={stats.metrics.totalHostels} 
                    icon={FaHotel} 
                    color="blue" 
                />
                <StatCard 
                    title="Students" 
                    value={stats.metrics.totalStudents} 
                    icon={FaUsers} 
                    color="indigo" 
                    trendValue={stats.metrics.userGrowth}
                />
                <StatCard 
                    title="Asset Owners" 
                    value={stats.metrics.totalOwners} 
                    icon={FaUsers} 
                    color="amber" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Platform Revenue Trend</h3>
                    <div className="h-[250px]">
                        <RevenueAreaChart data={stats.charts.growthTrend} />
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">User Acquisition</h3>
                    <div className="h-[250px]">
                        <UserGrowthBarChart data={stats.charts.growthTrend} />
                    </div>
                </div>
            </div>

            <div className="bg-gray-900 p-10 rounded-[3rem] text-white overflow-hidden relative">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black tracking-tight mb-2">System Health Overview</h3>
                    <p className="text-gray-400 font-medium max-w-2xl">
                        The platform is currently operating at optimal capacity. User growth is up by 
                        <span className="text-emerald-400 font-bold ml-1">{stats.metrics.userGrowth}%</span> this month.
                    </p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <FaChartLine size={200} />
                </div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
        </div>
    );
}
