import React from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import { RevenueAreaChart, RoomTypeDonutChart } from '../../../components/dashboard/AnalyticsCharts';
import { FaWallet, FaChartLine, FaCalendarCheck, FaRegClock, FaHeart } from 'react-icons/fa';

export default function OwnerDashboard({ stats }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Bento Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Earnings" 
                    value={`Rs. ${stats.metrics.totalEarnings.toLocaleString()}`} 
                    icon={FaWallet} 
                    color="emerald" 
                    trendValue={stats.metrics.revenueGrowth} 
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
            </div>

            {/* Main Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend - Spans 2 columns */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Revenue Analysis</h3>
                            <p className="text-sm text-gray-400 font-medium">Monthly performance overview (NPR)</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full bg-emerald-500" />
                             <span className="text-xs font-bold text-gray-500 uppercase">Growth Plan</span>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <RevenueAreaChart data={stats.charts.revenueTrend} />
                    </div>
                </div>

                {/* Room Distribution - Spans 1 column */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Room Types</h3>
                    <div className="h-[300px] flex items-center justify-center">
                        <RoomTypeDonutChart data={stats.charts.roomTypeDistribution} />
                    </div>
                </div>
            </div>

            {/* Bottom Row - Rating & Meta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-lg overflow-hidden relative group">
                    <div className="relative z-10">
                        <FaHeart className="text-white/20 absolute -right-4 -top-4" size={120} />
                        <h3 className="text-lg font-bold opacity-80 uppercase tracking-widest text-sm">Average Rating</h3>
                        <p className="text-6xl font-black mt-2 tracking-tighter">{stats.metrics.averageRating}</p>
                        <div className="flex gap-1 mt-4">
                            {[...Array(5)].map((_, i) => (
                                <FaHeart 
                                    key={i} 
                                    className={`${i < Math.round(stats.metrics.averageRating) ? 'text-white' : 'text-white/30'}`} 
                                    size={16} 
                                />
                            ))}
                        </div>
                        <p className="text-sm mt-6 font-medium text-white/70">Based on recent customer reviews</p>
                    </div>
                    {/* Decorative glass circle */}
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                </div>

                <div className="md:col-span-2 bg-emerald-50/50 border border-emerald-100 p-8 rounded-[2.5rem] flex flex-col justify-center">
                    <h3 className="text-xl font-black text-emerald-900 mb-2">Smart Insights</h3>
                    <p className="text-emerald-700 leading-relaxed font-medium">
                        Your occupancy rate is <span className="font-black underline">{stats.metrics.occupancyRate}%</span>. 
                        {stats.metrics.occupancyRate > 80 
                            ? " Consider increasing prices for premium rooms to maximize revenue." 
                            : " Try offering mid-week discounts to boost bookings!"}
                    </p>
                </div>
            </div>
        </div>
    );
}
