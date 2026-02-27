import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { FaCalendarAlt, FaCheck, FaTimes, FaMapMarkerAlt, FaUser } from 'react-icons/fa';

export default function Visits() {
    const { user } = useAuth();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        try {
            setLoading(true);
            const response = await api.get('/visits');
            setVisits(response.data.visits || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load visits');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (visitId, status) => {
        try {
            await api.patch(`/visits/${visitId}/status`, { status });
            fetchVisits(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update visit status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            case 'REQUESTED': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Scheduled Visits</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    {user?.role === 'owner'
                        ? 'Manage incoming visit requests from students.'
                        : 'Keep track of your scheduled property visits.'}
                </p>
            </div>

            {error ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center shadow-sm">
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            ) : visits.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 mb-6">
                        <FaCalendarAlt className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No visits scheduled</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        {user?.role === 'owner'
                            ? "You don't have any visit requests yet."
                            : "You haven't scheduled any property visits yet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {visits.map((visit) => (
                        <div key={visit.visit_id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                                    {visit.hostel?.images && visit.hostel.images.length > 0 ? (
                                        <img
                                            src={api.defaults.baseURL.replace('/api', '') + visit.hostel.images[0].image_url}
                                            alt={visit.hostel.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <FaMapMarkerAlt size={24} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{visit.hostel?.name}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2">
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            <FaCalendarAlt className="text-emerald-600" />
                                            {visit.visit_date}
                                        </p>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-emerald-600" />
                                            {visit.hostel?.city}
                                        </p>
                                        {user?.role === 'owner' && (
                                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                                <FaUser className="text-emerald-600" />
                                                {visit.student?.first_name} {visit.student?.last_name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(visit.status)}`}>
                                    {visit.status}
                                </span>

                                {user?.role === 'owner' && visit.status === 'REQUESTED' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleStatusUpdate(visit.visit_id, 'APPROVED')}
                                            className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                                            title="Approve"
                                        >
                                            <FaCheck />
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(visit.visit_id, 'REJECTED')}
                                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                            title="Reject"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
