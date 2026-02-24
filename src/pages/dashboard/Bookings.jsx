import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';

export default function Bookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const isOwner = user?.role === 'owner' || user?.role === 'admin';

    useEffect(() => {
        fetchBookings();
    }, [user?.role]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const endpoint = isOwner ? '/bookings/owner' : '/bookings/student';
            const res = await api.get(endpoint);
            setBookings(res.data.bookings || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        if (!window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this booking?`)) return;

        try {
            setActionLoading(bookingId);
            await api.put(`/bookings/${bookingId}/status`, { status: newStatus });

            // Update local state to reflect change instantly
            setBookings(bookings.map(b => b.booking_id === bookingId ? { ...b, status: newStatus } : b));

        } catch (err) {
            alert(err.response?.data?.error || `Failed to ${newStatus.toLowerCase()} booking`);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-amber-100 text-amber-800 border-amber-200'; // REQUESTED
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
                <p className="text-gray-500 mt-1">
                    {isOwner ? 'Manage incoming booking requests for your properties.' : 'Track the status of your room booking requests.'}
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                    {error}
                </div>
            )}

            {bookings.length === 0 && !error ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
                    <p className="text-gray-500">
                        {isOwner ? "You don't have any booking requests yet." : "You haven't requested any bookings yet."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                                    {isOwner && <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>}
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    {isOwner && <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {bookings.map((booking) => (
                                    <tr key={booking.booking_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 shrink-0 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold">
                                                    {booking.room?.hostel?.name?.[0] || 'H'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{booking.room?.hostel?.name || 'Unknown Hostel'}</div>
                                                    <div className="text-sm text-gray-500">{booking.room?.room_type} Room</div>
                                                </div>
                                            </div>
                                        </td>

                                        {isOwner && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">{booking.student?.first_name} {booking.student?.last_name}</div>
                                                <div className="text-xs text-gray-500">{booking.student?.email}</div>
                                            </td>
                                        )}

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(booking.start_date).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                to {new Date(booking.end_date).toLocaleDateString()}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusStyle(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>

                                        {isOwner && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {booking.status === 'REQUESTED' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleStatusChange(booking.booking_id, 'APPROVED')}
                                                            disabled={actionLoading === booking.booking_id}
                                                            className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200 disabled:opacity-50"
                                                        >
                                                            {actionLoading === booking.booking_id ? '...' : 'Approve'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(booking.booking_id, 'REJECTED')}
                                                            disabled={actionLoading === booking.booking_id}
                                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-200 disabled:opacity-50"
                                                        >
                                                            {actionLoading === booking.booking_id ? '...' : 'Reject'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">Handled</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
