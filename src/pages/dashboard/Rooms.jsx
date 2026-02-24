import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function Rooms() {
    const [hostels, setHostels] = useState([]);
    const [selectedHostelId, setSelectedHostelId] = useState('');
    const [rooms, setRooms] = useState([]);

    const [loading, setLoading] = useState(true);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [error, setError] = useState('');

    const roomTypeLabels = {
        'SINGLE': 'Single',
        'DOUBLE': 'Double',
        'TRIPLE': 'Triple',
        'DORM': 'Dormitory'
    };

    // Fetch the owner's hostels when the component mounts
    useEffect(() => {
        fetchHostels();
    }, []);

    // When the selected hostel changes, fetch its specific rooms
    // Actually, /api/hostels/my-hostels already includes rooms, but we might want just those for the selected one.
    useEffect(() => {
        if (selectedHostelId && hostels.length > 0) {
            const hostel = hostels.find(h => h.hostel_id === Number(selectedHostelId));
            if (hostel) {
                setRooms(hostel.rooms || []);
            } else {
                setRooms([]);
            }
        } else {
            setRooms([]);
        }
    }, [selectedHostelId, hostels]);

    const fetchHostels = async () => {
        try {
            setLoading(true);
            const response = await api.get('/hostels/my-hostels');
            const loadedHostels = response.data.hostels || [];
            setHostels(loadedHostels);

            if (loadedHostels.length > 0) {
                // Auto-select the first hostel if none is selected
                setSelectedHostelId(loadedHostels[0].hostel_id.toString());
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load your hostels');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm('Are you sure you want to delete this room? This cannot be undone.')) return;

        try {
            await api.delete(`/rooms/${roomId}`);
            // Optimistically remove from UI
            setRooms(rooms.filter(r => r.room_id !== roomId));

            // Update the main hostels state so it's fresh if they toggle back
            setHostels(hostels.map(h => {
                if (h.hostel_id === Number(selectedHostelId)) {
                    return { ...h, rooms: h.rooms.filter(r => r.room_id !== roomId) };
                }
                return h;
            }));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete room');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Rooms</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure pricing and availability for your properties</p>
                </div>

                {hostels.length > 0 && selectedHostelId && (
                    <div className="mt-4 sm:mt-0">
                        <Link
                            to={`/dashboard/rooms/new?hostelId=${selectedHostelId}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Room
                        </Link>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
            )}

            {hostels.length === 0 && !error ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 mb-4">
                        <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No hostels available</h3>
                    <p className="text-gray-500 text-sm mb-6">You need to add a hostel before you can create rooms.</p>
                    <Link
                        to="/dashboard/hostels/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors"
                    >
                        Create Your First Hostel
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Hostel Selector */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <label htmlFor="hostel-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Select Property:
                        </label>
                        <select
                            id="hostel-select"
                            value={selectedHostelId}
                            onChange={(e) => setSelectedHostelId(e.target.value)}
                            className="block w-full sm:max-w-xs pl-3 pr-10 py-2 border border-gray-200 bg-gray-50 text-base focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl transition-colors"
                        >
                            <option value="" disabled>Choose a hostel</option>
                            {hostels.map(h => (
                                <option key={h.hostel_id} value={h.hostel_id}>
                                    {h.name} {h.status !== 'APPROVED' ? `(${h.status})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Rooms List */}
                    {selectedHostelId && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Rooms in this property</h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Total: {rooms.length}
                                </span>
                            </div>

                            {rooms.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    No rooms added to this property yet.
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {rooms.map(room => (
                                        <li key={room.room_id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">

                                            <div className="flex-1 w-full gap-4 grid grid-cols-2 lg:grid-cols-4">
                                                {/* Type & Status */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-bold text-gray-900">{roomTypeLabels[room.room_type] || room.room_type} Room</span>
                                                        {room.status === 'AVAILABLE' ? (
                                                            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full"></span>
                                                        ) : (
                                                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 capitalize">{room.status.toLowerCase()}</div>
                                                </div>

                                                {/* Price */}
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Monthly Rent</p>
                                                    <p className="text-sm font-semibold text-emerald-700">Rs. {Number(room.price).toLocaleString()}</p>
                                                </div>

                                                {/* Beds */}
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Occupancy</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {room.available_beds} of {room.total_beds} beds free
                                                    </p>
                                                </div>

                                                {/* Description Preview */}
                                                <div className="col-span-2 lg:col-span-1 border-t lg:border-t-0 pt-3 lg:pt-0">
                                                    <p className="text-xs text-gray-500 line-clamp-2">
                                                        {room.description || "No description provided."}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3 shrink-0">
                                                <Link
                                                    to={`/dashboard/rooms/${room.room_id}/edit`}
                                                    className="text-emerald-600 hover:text-emerald-900 text-sm font-medium"
                                                >
                                                    Edit
                                                </Link>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    onClick={() => handleDeleteRoom(room.room_id)}
                                                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
