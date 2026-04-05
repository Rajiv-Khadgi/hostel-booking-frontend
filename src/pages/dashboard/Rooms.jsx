import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import RoomFormDialog from '../../components/RoomFormDialog';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import {
    FiHome, FiPlus, FiEdit2, FiTrash2, FiUser, FiUsers,
    FiGrid, FiAlertCircle, FiCheckCircle, FiXCircle, FiChevronDown
} from 'react-icons/fi';

const ROOM_TYPE_CONFIG = {
    SINGLE: { label: 'Single', icon: FiUser,  badge: 'bg-blue-100 text-blue-700',    bar: 'bg-blue-400',   header: 'bg-blue-50',   dot: 'bg-blue-400'   },
    DOUBLE: { label: 'Double', icon: FiUsers, badge: 'bg-violet-100 text-violet-700', bar: 'bg-violet-400', header: 'bg-violet-50', dot: 'bg-violet-400' },
    TRIPLE: { label: 'Triple', icon: FiUsers, badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-400', header: 'bg-orange-50', dot: 'bg-orange-400' },
    DORM:   { label: 'Dorm',   icon: FiGrid,  badge: 'bg-teal-100 text-teal-700',     bar: 'bg-teal-500',   header: 'bg-teal-50',   dot: 'bg-teal-400'   },
};

export default function Rooms() {
    const [hostels, setHostels] = useState([]);
    const [selectedHostelId, setSelectedHostelId] = useState('');
    const [rooms, setRooms] = useState([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 6;

    useEffect(() => { fetchHostels(); }, []);

    useEffect(() => {
        if (selectedHostelId && hostels.length > 0) {
            const hostel = hostels.find(h => h.hostel_id === Number(selectedHostelId));
            setRooms(hostel ? hostel.rooms || [] : []);
            setPage(1);
            setSearch('');
        } else {
            setRooms([]);
        }
    }, [selectedHostelId, hostels]);

    const fetchHostels = async () => {
        try {
            setLoading(true);
            const response = await api.get('/hostels/my-hostels');
            const loaded = response.data.hostels || [];
            setHostels(loaded);
            if (loaded.length > 0) setSelectedHostelId(loaded[0].hostel_id.toString());
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load your hostels');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm('Delete this room? This cannot be undone.')) return;
        try {
            await api.delete(`/rooms/${roomId}`);
            setRooms(prev => prev.filter(r => r.room_id !== roomId));
            setHostels(prev => prev.map(h =>
                h.hostel_id === Number(selectedHostelId)
                    ? { ...h, rooms: h.rooms.filter(r => r.room_id !== roomId) }
                    : h
            ));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete room');
        }
    };

    const availableCount = rooms.filter(r => r.status === 'AVAILABLE').length;
    const occupiedCount = rooms.length - availableCount;

    // Filter and Paginate
    const filteredRooms = rooms.filter(r => {
        if (!search) return true;
        const s = search.toLowerCase();
        const roomNum = r.room_number?.toString().toLowerCase() || '';
        const roomType = r.room_type?.toLowerCase() || '';
        return roomNum.includes(s) || roomType.includes(s);
    });

    const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));
    const paginatedRooms = filteredRooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [search]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                    </div>
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest animate-pulse">Loading rooms…</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-2.5 mb-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full uppercase tracking-widest">
                            Rooms
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Rooms</h1>
                    <p className="text-gray-500 mt-1 text-sm">Configure pricing and availability for your properties</p>
                </div>
                {hostels.length > 0 && selectedHostelId && (
                    <button
                        onClick={() => setShowAddDialog(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm transition-all shrink-0"
                    >
                        <FiPlus size={15} />
                        Add New Room
                    </button>
                )}
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                    <FiAlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
            )}

            {/* ── No Hostels Empty State ── */}
            {hostels.length === 0 && !error ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mb-4">
                        <FiHome size={24} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No properties yet</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Add a hostel first before you can create rooms.</p>
                    <Link
                        to="/dashboard/hostels"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors"
                    >
                        <FiPlus size={14} />
                        Create Your First Hostel
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">

                    {/* ── Property Selector & Search ── */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                            <label htmlFor="hostel-select" className="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0">
                                Select Property
                            </label>
                            <div className="relative w-full sm:max-w-xs">
                                <FiHome size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <select
                                    id="hostel-select"
                                    value={selectedHostelId}
                                    onChange={(e) => setSelectedHostelId(e.target.value)}
                                    className="w-full pl-9 pr-9 py-2.5 border-0 bg-white ring-1 ring-inset ring-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/50 hover:ring-gray-300 transition-all text-sm text-gray-900 rounded-xl appearance-none"
                                >
                                    <option value="" disabled>Choose a hostel</option>
                                    {hostels.map(h => (
                                        <option key={h.hostel_id} value={h.hostel_id}>
                                            {h.name}{h.status !== 'APPROVED' ? ` (${h.status})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <FiChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {selectedHostelId && rooms.length > 0 && (
                            <SearchBar
                                value={search}
                                onChange={setSearch}
                                placeholder="Search by room number or type..."
                                className="w-full lg:max-w-xs"
                            />
                        )}
                    </div>

                    {/* ── Room Stats ── */}
                    {selectedHostelId && rooms.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Total Rooms',  value: rooms.length,    color: 'gray',    icon: FiHome         },
                                { label: 'Available',    value: availableCount,  color: 'emerald', icon: FiCheckCircle  },
                                { label: 'Occupied',     value: occupiedCount,   color: 'red',     icon: FiXCircle      },
                            ].map(({ label, value, color, icon: Icon }) => (
                                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                        color === 'emerald' ? 'bg-emerald-50' :
                                        color === 'red'     ? 'bg-red-50'     : 'bg-gray-50'
                                    }`}>
                                        <Icon size={16} className={
                                            color === 'emerald' ? 'text-emerald-600' :
                                            color === 'red'     ? 'text-red-500'     : 'text-gray-500'
                                        } />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Rooms Grid ── */}
                    {selectedHostelId && (
                        <>
                            {/* Section header */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700">
                                    Rooms in this property
                                </h3>
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                    {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} found
                                </span>
                            </div>

                            {rooms.length === 0 ? (
                                <div className="py-16 flex flex-col items-center gap-3 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                                    <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center">
                                        <FiHome size={18} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm text-gray-400">No rooms added to this property yet.</p>
                                    <button
                                        onClick={() => setShowAddDialog(true)}
                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                                    >
                                        <FiPlus size={14} /> Add First Room
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {paginatedRooms.map(room => {
                                        const cfg = ROOM_TYPE_CONFIG[room.room_type] || ROOM_TYPE_CONFIG.SINGLE;
                                        const TypeIcon = cfg.icon;
                                        const total = Number(room.total_beds);
                                        const available = Number(room.available_beds);
                                        const occupied = total - available;
                                        const isFull = available === 0;

                                        // Bed slots — cap display at 8, show overflow count
                                        const maxDots = 8;
                                        const displayDots = Math.min(total, maxDots);
                                        const overflow = total > maxDots ? total - maxDots : 0;

                                        return (
                                            <div
                                                key={room.room_id}
                                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
                                            >
                                                {/* Colored type header */}
                                                <div className={`${cfg.header} px-4 pt-4 pb-3 flex items-center justify-between`}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cfg.badge}`}>
                                                            <TypeIcon size={15} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 leading-none mb-0.5">{cfg.label}</p>
                                                            <p className="text-sm font-semibold text-gray-900 leading-none">
                                                                {room.room_number ? `Room #${room.room_number}` : cfg.label}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                        isFull ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                        {isFull ? 'Full' : 'Available'}
                                                    </span>
                                                </div>

                                                {/* Body */}
                                                <div className="px-4 py-3 flex-1 flex flex-col gap-3">

                                                    {/* Bed slots */}
                                                    <div>
                                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                                                            Beds — {available} free · {occupied} occupied
                                                        </p>
                                                        <div className="flex items-center gap-1 flex-wrap">
                                                            {Array.from({ length: displayDots }).map((_, i) => (
                                                                <span
                                                                    key={i}
                                                                    title={i < occupied ? 'Occupied' : 'Available'}
                                                                    className={`w-4 h-4 rounded-full border-2 transition-colors ${
                                                                        i < occupied
                                                                            ? `${cfg.dot} border-transparent`
                                                                            : 'bg-white border-gray-200'
                                                                    }`}
                                                                />
                                                            ))}
                                                            {overflow > 0 && (
                                                                <span className="text-[10px] font-medium text-gray-400 ml-1">+{overflow} more</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                        <div>
                                                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Monthly Rent</p>
                                                            <p className="text-sm font-semibold text-emerald-700">
                                                                Rs. {Number(room.price).toLocaleString()}
                                                            </p>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                onClick={() => setEditingRoom(room)}
                                                                title="Edit room"
                                                                className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                            >
                                                                <FiEdit2 size={13} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRoom(room.room_id)}
                                                                title="Delete room"
                                                                className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                            >
                                                                <FiTrash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Pagination
                                    page={page}
                                    totalPages={totalPages}
                                    totalItems={filteredRooms.length}
                                    pageSize={PAGE_SIZE}
                                    onPageChange={setPage}
                                />
                            )}
                        </>
                    )}
                </div>
            )}

            <RoomFormDialog
                isOpen={showAddDialog || !!editingRoom}
                onClose={() => { setShowAddDialog(false); setEditingRoom(null); }}
                onSuccess={fetchHostels}
                defaultHostelId={selectedHostelId ? Number(selectedHostelId) : undefined}
                roomId={editingRoom?.room_id}
                roomData={editingRoom}
            />
        </div>
    );
}
