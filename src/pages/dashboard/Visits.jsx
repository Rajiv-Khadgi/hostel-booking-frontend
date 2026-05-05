import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import SearchBar from '../../components/common/SearchBar';
import FilterSelect from '../../components/common/FilterSelect';
import Pagination from '../../components/common/Pagination';
import { getFriendlyErrorMessage } from '../../utils/errorUtils';
import {
    FiCalendar, FiMapPin, FiUser, FiFilter,
    FiCheck, FiX, FiAlertCircle 
} from 'react-icons/fi';
import { getImageUrl } from '../../utils/hostelUtils';

const STATUS_CONFIG = {
    REQUESTED: { label: 'Requested', badge: 'bg-amber-100 text-amber-700 border-amber-200'       },
    APPROVED:  { label: 'Approved',  badge: 'bg-emerald-100 text-emerald-700 border-emerald-200'  },
    REJECTED:  { label: 'Rejected',  badge: 'bg-red-100 text-red-700 border-red-200'              },
};

const PAGE_SIZE = 8;

export default function Visits() {
    const { user } = useAuth();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);

    const isOwner = user?.role === 'owner' || user?.role === 'admin';

    useEffect(() => { fetchVisits(); }, []);

    const fetchVisits = async () => {
        try {
            setLoading(true);
            const res = await api.get('/visits');
            setVisits(res.data.visits || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load visits');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (visitId, status) => {
        try {
            setActionLoading(visitId);
            await api.patch(`/visits/${visitId}/status`, { status });
            setVisits(prev => prev.map(v => v.visit_id === visitId ? { ...v, status } : v));
            toast.success(`Visit ${status.toLowerCase()} successfully`);
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, 'Failed to update visit status'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancelVisit = async (visitId) => {
        try {
            setActionLoading(visitId);
            await api.patch(`/visits/${visitId}/cancel`);
            setVisits(prev => prev.filter(v => v.visit_id !== visitId));
            toast.success('Visit cancelled successfully');
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, 'Failed to cancel visit'));
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = useMemo(() => {
        return visits.filter(v => {
            const hostelName = v.hostel?.name?.toLowerCase() || '';
            const city = v.hostel?.city?.toLowerCase() || '';
            const student = `${v.student?.first_name || ''} ${v.student?.last_name || ''}`.toLowerCase();
            const matchesSearch = !search || hostelName.includes(search.toLowerCase()) || city.includes(search.toLowerCase()) || student.includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
            const visitDate = v.visit_date ? new Date(v.visit_date) : null;
            const matchesFrom = !dateFrom || (visitDate && visitDate >= new Date(dateFrom));
            const matchesTo = !dateTo || (visitDate && visitDate <= new Date(dateTo));
            return matchesSearch && matchesStatus && matchesFrom && matchesTo;
        });
    }, [visits, search, statusFilter, dateFrom, dateTo]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handlePageChange = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => { setPage(1); }, [search, statusFilter, dateFrom, dateTo]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                    </div>
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest animate-pulse">Loading visits…</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-2.5 mb-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full uppercase tracking-widest">
                            Visits
                        </span>
                        {visits.length > 0 && (
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                                {visits.length} total
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Scheduled Visits</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        {isOwner ? 'Manage incoming visit requests from students.' : 'Keep track of your scheduled property visits.'}
                    </p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                    <FiAlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
            )}

            {/* Filters */}
            {visits.length > 0 && (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
                    <div className="flex flex-wrap items-center gap-3">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder={isOwner ? 'Search hostel or student…' : 'Search hostel or city…'}
                            className="flex-1 min-w-50"
                        />
                        <FilterSelect
                            value={statusFilter}
                            onChange={setStatusFilter}
                            configObject={STATUS_CONFIG}
                            icon={FiFilter}
                            defaultLabel="All Statuses"
                            className="w-full sm:w-auto"
                        />
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50/50 hover:bg-gray-50 transition-colors rounded-xl border border-gray-100/50">
                            <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                                <FiCalendar size={13} className="text-gray-400" /> Date:
                            </span>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="px-2 py-1.5 rounded-lg border-0 bg-transparent text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                            />
                            <span className="text-xs text-gray-400 font-medium">to</span>
                            <input
                                type="date"
                                value={dateTo}
                                min={dateFrom}
                                onChange={e => setDateTo(e.target.value)}
                                className="px-2 py-1.5 rounded-lg border-0 bg-transparent text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                            />
                            {(dateFrom || dateTo) && (
                                <button
                                    onClick={() => { setDateFrom(''); setDateTo(''); }}
                                    className="ml-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors active:scale-95"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {visits.length === 0 && !error ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mb-4">
                        <FiCalendar size={24} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No visits scheduled</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                        {isOwner ? "You don't have any visit requests yet." : "You haven't scheduled any property visits yet."}
                    </p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <p className="text-sm text-gray-400">No visits match your filters.</p>
                    <button
                        onClick={() => { setSearch(''); setStatusFilter('ALL'); setDateFrom(''); setDateTo(''); }}
                        className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {paginated.map(visit => {
                            const sc = STATUS_CONFIG[visit.status] || STATUS_CONFIG.REQUESTED;
                            const isActioning = actionLoading === visit.visit_id;
                            return (
                                <div
                                    key={visit.visit_id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    {/* Left: image + info */}
                                    <div className="flex items-start gap-4">
                                        <div className="h-14 w-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                                            {visit.hostel?.images?.length > 0 ? (
                                                <img
                                                    src={getImageUrl(visit.hostel.images[0].image_url, api.defaults.baseURL)}
                                                    alt={visit.hostel.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <FiMapPin size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{visit.hostel?.name}</p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                                                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <FiCalendar size={11} className="text-emerald-500" />
                                                    {new Date(visit.visit_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <FiMapPin size={11} className="text-emerald-500" />
                                                    {visit.hostel?.city}
                                                </span>
                                                {isOwner && visit.student && (
                                                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <FiUser size={11} className="text-emerald-500" />
                                                        {visit.student.first_name} {visit.student.last_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: status + actions */}
                                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${sc.badge}`}>
                                            {sc.label}
                                        </span>
                                        {isOwner && visit.status === 'REQUESTED' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(visit.visit_id, 'APPROVED')}
                                                    disabled={isActioning}
                                                    title="Approve"
                                                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                                >
                                                    {isActioning ? <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> : <FiCheck size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(visit.visit_id, 'REJECTED')}
                                                    disabled={isActioning}
                                                    title="Reject"
                                                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                >
                                                    <FiX size={14} />
                                                </button>
                                            </div>
                                        )}
                                        {!isOwner && visit.status === 'REQUESTED' && (
                                            <button
                                                onClick={() => handleCancelVisit(visit.visit_id)}
                                                disabled={isActioning}
                                                title="Cancel"
                                                className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                            >
                                                {isActioning ? <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <FiX size={14} />}
                                            </button>
                                        )}
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
                            totalItems={filtered.length} 
                            pageSize={PAGE_SIZE} 
                            onPageChange={setPage} 
                        />
                    )}
                </>
            )}
        </div>
    );
}
