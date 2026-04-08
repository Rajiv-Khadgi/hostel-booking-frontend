import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import StudentDashboard from './roles/StudentDashboard';
import OwnerDashboard from './roles/OwnerDashboard';
import AdminDashboard from './roles/AdminDashboard';

export default function Overview() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStats = React.useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/dashboard/stats');
            console.log('Dashboard API Response:', res.data);
            setStats(res.data.stats);
        } catch (err) {
            setError('Failed to load dashboard statistics');
            console.error('Dashboard Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                    </div>
                </div>
                <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Curating your analytics...</p>
            </div>
        );
    }

    if (!stats || !stats.metrics) return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <p>No data available yet.</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full uppercase tracking-widest">
                        {user?.role} Portal
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                    Welcome back, <span className="text-emerald-600">{user?.first_name}</span>.
                </h1>
                <p className="text-gray-500 mt-2 text-lg font-medium">
                    Here's a perspective on your hostel platform activity today.
                </p>
            </header>

            {error && (
                <div className="mb-8 bg-rose-50 text-rose-600 p-6 rounded-3xl border border-rose-100 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    <p className="font-bold">{error}</p>
                    <button 
                        onClick={fetchStats}
                        className="ml-auto px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="relative">
                {user?.role === 'student' && <StudentDashboard stats={stats} />}
                {user?.role === 'owner' && <OwnerDashboard stats={stats} />}
                {user?.role === 'admin' && <AdminDashboard stats={stats} />}
            </div>
            
            <footer className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-center text-gray-400 text-sm font-medium">
                 <p>© 2024 Hostel Booking Pern. All analytics are real-time.</p>
                 <div className="flex gap-6">
                     <button className="hover:text-gray-600 transition-colors underline decoration-2 underline-offset-4">Download PDF Report</button>
                     <button className="hover:text-gray-600 transition-colors underline decoration-2 underline-offset-4">API Documentation</button>
                 </div>
            </footer>
        </div>
    );
}
