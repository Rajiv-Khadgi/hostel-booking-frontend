import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    FaBuilding, 
    FaTrash, 
    FaUser, 
    FaMapMarkerAlt, 
    FaBed,
    FaStar,
    FaExternalLinkAlt,
    FaCheck,
    FaTimes,
    FaClock
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function AdminHostels() {
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchHostels();
    }, []);

    const fetchHostels = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/hostels');
            setHostels(res.data.hostels);
        } catch (err) {
            setError('Failed to fetch hostels');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (hostelId, newStatus) => {
        try {
            await api.patch(`/admin/hostels/${hostelId}/status`, { status: newStatus });
            setHostels(hostels.map(h => h.hostel_id === hostelId ? { ...h, status: newStatus } : u));
            // Actually, I should refresh or update local state correctly
            setHostels(prev => prev.map(h => h.hostel_id === hostelId ? { ...h, status: newStatus } : h));
        } catch (err) {
            alert('Failed to update hostel status');
        }
    };

    const handleDeleteHostel = async (hostelId) => {
        if (!window.confirm('Are you sure you want to delete this hostel? This action CANNOT be undone and will delete all associated rooms and bookings.')) {
            return;
        }

        try {
            await api.delete(`/admin/hostels/${hostelId}`);
            setHostels(hostels.filter(h => h.hostel_id !== hostelId));
        } catch (err) {
            alert('Failed to delete hostel');
        }
    };

    const filteredHostels = hostels.filter(h => filter === 'ALL' || h.status === filter);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hostel Oversight</h1>
                    <p className="text-gray-500 mt-2">Manage all properties listed on the platform and monitor compliance.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 border border-gray-200 rounded-2xl shadow-sm">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">{error}</div>
            ) : filteredHostels.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                        <FaBuilding size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hostels found</h3>
                    <p className="text-gray-500">There are no hostels matching the current filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHostels.map((hostel) => (
                        <div key={hostel.hostel_id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <div className="h-48 relative overflow-hidden group">
                                <img 
                                    src={hostel.images?.[0]?.image_url ? `${api.defaults.baseURL.replace('/api', '')}/${hostel.images[0].image_url}` : 'https://images.unsplash.com/photo-1555854811-8221a7eaa145?auto=format&fit=crop&q=80&w=800'} 
                                    alt={hostel.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-gray-700 shadow-sm border border-white/50 uppercase tracking-wider">
                                        {hostel.hostel_type || 'General'}
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-sm border uppercase tracking-wider flex items-center gap-1 ${getStatusStyle(hostel.status)}`}>
                                        {hostel.status === 'PENDING' && <FaClock />}
                                        {hostel.status === 'APPROVED' && <FaCheck />}
                                        {hostel.status === 'REJECTED' && <FaTimes />}
                                        {hostel.status}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-extrabold text-gray-900 line-clamp-1">{hostel.name}</h3>
                                </div>

                                <div className="space-y-3 mb-6 flex-1">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                            <FaMapMarkerAlt size={14} />
                                        </div>
                                        <span className="truncate">{hostel.address}, {hostel.city}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 font-bold text-xs">
                                            {hostel.owner?.first_name?.[0]}
                                        </div>
                                        <span className="truncate">Owner: <span className="text-gray-900 font-bold">{hostel.owner?.first_name} {hostel.owner?.last_name}</span></span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <Link 
                                            to={`/hostels/${hostel.hostel_id}`}
                                            target="_blank"
                                            className="px-4 py-2 bg-gray-50 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
                                        >
                                            Preview <FaExternalLinkAlt size={10} />
                                        </Link>
                                        <button 
                                            onClick={() => handleDeleteHostel(hostel.hostel_id)}
                                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Delete Hostel"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>

                                    {hostel.status === 'PENDING' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => handleUpdateStatus(hostel.hostel_id, 'APPROVED')}
                                                className="flex justify-center items-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                                            >
                                                <FaCheck size={10} /> Approve
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateStatus(hostel.hostel_id, 'REJECTED')}
                                                className="flex justify-center items-center gap-2 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl font-bold text-xs hover:bg-red-50 transition-all"
                                            >
                                                <FaTimes size={10} /> Reject
                                            </button>
                                        </div>
                                    )}

                                    {hostel.status === 'REJECTED' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(hostel.hostel_id, 'APPROVED')}
                                            className="w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all border border-emerald-100"
                                        >
                                            Re-approve
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
