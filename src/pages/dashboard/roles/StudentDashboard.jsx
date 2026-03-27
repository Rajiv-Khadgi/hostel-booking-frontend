import React from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import { RevenueAreaChart } from '../../../components/dashboard/AnalyticsCharts';
import { FaCalendarCheck, FaWallet, FaHeart, FaEye, FaRegClock } from 'react-icons/fa';

export default function StudentDashboard({ stats }) {
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                    trendValue={stats.metrics.spendingGrowth}
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

            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-10">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Spending Behavior</h3>
                    <p className="text-gray-400 font-medium">Visualization of your hostel-related expenses (Last 6 Months)</p>
                </div>
                <div className="h-[300px]">
                    <RevenueAreaChart data={stats.charts.spendingTrend} color="#3b82f6" />
                </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2.5rem] flex items-center justify-between">
                <div>
                    <h4 className="text-indigo-900 font-black text-lg">Next Visit Reminder</h4>
                    <p className="text-indigo-700 font-medium italic mt-1">
                        {stats.metrics.upcomingVisits > 0 
                            ? `You have ${stats.metrics.upcomingVisits} visit set for this week. Don't forget your ID!`
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
