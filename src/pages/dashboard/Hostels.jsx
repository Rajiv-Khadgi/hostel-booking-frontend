import { useState, useEffect } from 'react';
import api from '../../api/axios';
import HostelFormDialog from '../../components/HostelFormDialog';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import {
    FiHome, FiMapPin, FiEdit2, FiPlus,
    FiCheckCircle, FiClock, FiXCircle, FiUsers, FiUser, FiAlertCircle
} from 'react-icons/fi';

const STATUS_CONFIG = {
    APPROVED: {
        label: 'Approved',
        icon: FiCheckCircle,
        badge: 'bg-emerald-100 text-emerald-700',
        dot: 'bg-emerald-500',
        overlayBadge: 'bg-emerald-500/90 text-white'
    },
    PENDING: {
        label: 'Pending',
        icon: FiClock,
        badge: 'bg-amber-100 text-amber-700',
        dot: 'bg-amber-400',
        overlayBadge: 'bg-amber-500/90 text-white'
    },
    REJECTED: {
        label: 'Rejected',
        icon: FiXCircle,
        badge: 'bg-red-100 text-red-700',
        dot: 'bg-red-500',
        overlayBadge: 'bg-red-500/90 text-white'
    },
};

const GENDER_LABELS = { BOYS: 'Boys Only', GIRLS: 'Girls Only', COED: 'Co-Ed' };

function StatusBadge({ status, overlay = false }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    const Icon = cfg.icon;
    if (overlay) {
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.overlayBadge} backdrop-blur-sm`}>
                <Icon size={10} />
                {cfg.label}
            </span>
        );
    }
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
            <Icon size={10} />
            {cfg.label}
        </span>
    );
}

export default function Hostels() {
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingHostel, setEditingHostel] = useState(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const PAGE_SIZE = 6;

    useEffect(() => { setPage(1); fetchHostels(); }, []);

    const fetchHostels = async () => {
        try {
            const response = await api.get('/hostels/my-hostels');
            setHostels(response.data.hostels || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load hostels');
        } finally {
            setLoading(false);
        }
    };

    const approvedCount = hostels.filter(h => h.status === 'APPROVED').length;
    const pendingCount = hostels.filter(h => h.status === 'PENDING').length;
    const totalRooms = hostels.reduce((sum, h) => sum + (h.rooms?.length || 0), 0);

    const filteredHostels = hostels.filter(h => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            h.name?.toLowerCase().includes(s) ||
            h.city?.toLowerCase().includes(s) ||
            h.area?.toLowerCase().includes(s)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filteredHostels.length / PAGE_SIZE));
    const paginatedHostels = filteredHostels.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const handlePageChange = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                    </div>
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest animate-pulse">Loading properties…</p>
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
                            Properties
                        </span>
                        {hostels.length > 0 && (
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                                {hostels.length} listing{hostels.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Hostels</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage your property listings and rooms</p>
                </div>
                <button
                    onClick={() => setShowAddDialog(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm transition-all shrink-0"
                >
                    <FiPlus size={16} />
                    Add New Hostel
                </button>
            </div>

            {/* ── Quick Stats ── */}
            {hostels.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Properties', value: hostels.length, icon: FiHome, color: 'emerald' },
                        { label: 'Approved', value: approvedCount, icon: FiCheckCircle, color: 'emerald' },
                        { label: 'Pending Review', value: pendingCount, icon: FiClock, color: 'amber' },
                        { label: 'Total Rooms', value: totalRooms, icon: FiHome, color: 'blue' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                color === 'emerald' ? 'bg-emerald-50' :
                                color === 'amber' ? 'bg-amber-50' : 'bg-blue-50'
                            }`}>
                                <Icon size={18} className={
                                    color === 'emerald' ? 'text-emerald-600' :
                                    color === 'amber' ? 'text-amber-500' : 'text-blue-600'
                                } />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
                                <p className="text-xs text-gray-500 font-medium mt-0.5 leading-tight">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Error ── */}
            {error && (
                <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                    <FiAlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 font-semibold">{error}</p>
                </div>
            )}

            {/* ── Empty State ── */}
            {hostels.length === 0 && !error ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 mb-5">
                        <FiHome size={28} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No properties yet</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Get started by listing your first hostel to reach students looking for accommodation.</p>
                    <button
                        onClick={() => setShowAddDialog(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors"
                    >
                        <FiPlus size={14} />
                        Add Your First Hostel
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <h3 className="text-sm font-semibold text-gray-700">
                            {filteredHostels.length} {filteredHostels.length === 1 ? 'property' : 'properties'} found
                        </h3>
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder="Search properties..."
                            className="w-full sm:max-w-xs"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {paginatedHostels.map((hostel) => {
                            const roomCount = hostel.rooms?.length || 0;
                        const GenderIcon = hostel.gender_type === 'BOYS' || hostel.gender_type === 'GIRLS' ? FiUser : FiUsers;

                        return (
                            <div
                                key={hostel.hostel_id}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col group"
                            >
                                {/* Image */}
                                <div className="relative h-52 bg-gray-100 overflow-hidden">
                                    {hostel.images && hostel.images.length > 0 ? (
                                        <img
                                            src={api.defaults.baseURL.replace('/api', '') + hostel.images[0].image_url}
                                            alt={hostel.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-linear-to-br from-gray-50 to-gray-100">
                                            <FiHome size={36} className="text-gray-300" />
                                            <span className="text-xs text-gray-400 font-semibold">No photos added</span>
                                        </div>
                                    )}
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />

                                    {/* Status badge — top left */}
                                    <div className="absolute top-3 left-3">
                                        <StatusBadge status={hostel.status} overlay />
                                    </div>

                                    {/* Gender badge — top right */}
                                    {hostel.gender_type && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-700">
                                            <GenderIcon size={11} />
                                            {GENDER_LABELS[hostel.gender_type] || hostel.gender_type}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-base font-semibold text-gray-900 leading-tight mb-1.5 line-clamp-1">
                                        {hostel.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-5">
                                        <FiMapPin size={13} className="shrink-0 text-gray-400" />
                                        <span className="truncate">
                                            {hostel.city}{hostel.area ? `, ${hostel.area}` : ''}
                                        </span>
                                    </p>

                                    {/* Footer row */}
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl">
                                            <FiHome size={13} className="text-emerald-600" />
                                            <span className="text-sm font-medium text-gray-700">
                                                {roomCount} {roomCount === 1 ? 'Room' : 'Rooms'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setEditingHostel(hostel)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors"
                                        >
                                            <FiEdit2 size={13} />
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination 
                            page={page} 
                            totalPages={totalPages} 
                            totalItems={filteredHostels.length} 
                            pageSize={PAGE_SIZE} 
                            onPageChange={setPage} 
                        />
                    )}
                </div>
            )}

            <HostelFormDialog
                isOpen={showAddDialog || !!editingHostel}
                onClose={() => { setShowAddDialog(false); setEditingHostel(null); }}
                onSuccess={fetchHostels}
                hostelId={editingHostel?.hostel_id}
                hostelData={editingHostel}
            />
        </div>
    );
}
