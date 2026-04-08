import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import SearchBar from '../../components/common/SearchBar';
import FilterSelect from '../../components/common/FilterSelect';
import Pagination from '../../components/common/Pagination';
import {
    FiCreditCard, FiFilter, FiAlertCircle, FiCalendar,
    FiCheckCircle, FiClock, FiXCircle 
} from 'react-icons/fi';

const STATUS_CONFIG = {
    COMPLETED: { label: 'Completed', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: FiCheckCircle },
    PENDING:   { label: 'Pending',   badge: 'bg-amber-100 text-amber-700 border-amber-200',       icon: FiClock       },
    FAILED:    { label: 'Failed',    badge: 'bg-red-100 text-red-700 border-red-200',             icon: FiXCircle     },
    REFUNDED:  { label: 'Refunded',  badge: 'bg-gray-100 text-gray-600 border-gray-200',          icon: FiXCircle     },
};

const TYPE_CONFIG = {
    FULL:    { label: 'Full',    badge: 'bg-emerald-50 text-emerald-700' },
    DEPOSIT: { label: 'Deposit', badge: 'bg-blue-50 text-blue-700'      },
    MONTHLY: { label: 'Monthly', badge: 'bg-violet-50 text-violet-700'  },
    BALANCE: { label: 'Balance', badge: 'bg-orange-50 text-orange-700'  },
};

const PAGE_SIZE = 10;

export default function Payments() {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);

    const isOwner = user?.role === 'owner';
    const isAdmin = user?.role === 'admin';

    useEffect(() => { fetchPayments(); }, [user?.role]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            let endpoint = '/payments/history/student';
            if (isOwner) endpoint = '/payments/history/owner';
            if (isAdmin) endpoint = '/payments/history/admin';
            const res = await api.get(endpoint);
            setPayments(res.data.payments || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch payment history');
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return payments.filter(p => {
            const student = `${p.booking?.student?.first_name || ''} ${p.booking?.student?.last_name || ''}`.toLowerCase();
            const hostel = (p.booking?.room?.hostel?.name || '').toLowerCase();
            const txn = `${p.transaction_id || ''} ${p.pidx || ''}`.toLowerCase();
            const matchesSearch = !search || student.includes(search.toLowerCase()) || hostel.includes(search.toLowerCase()) || txn.includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
            const matchesType = typeFilter === 'ALL' || p.payment_type === typeFilter;
            const paymentDate = p.createdAt ? new Date(p.createdAt) : null;
            const matchesFrom = !dateFrom || (paymentDate && paymentDate >= new Date(dateFrom));
            const matchesTo = !dateTo || (paymentDate && paymentDate <= new Date(dateTo + 'T23:59:59'));
            return matchesSearch && matchesStatus && matchesType && matchesFrom && matchesTo;
        });
    }, [payments, search, statusFilter, typeFilter, dateFrom, dateTo]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handlePageChange = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => { setPage(1); }, [search, statusFilter, typeFilter, dateFrom, dateTo]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                    </div>
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest animate-pulse">Loading payments…</p>
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
                            Payments
                        </span>
                        {payments.length > 0 && (
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                                {payments.length} total
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payment History</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        {isAdmin ? 'Complete overview of all transactions in the system.' : isOwner ? 'Track payments received for your properties.' : 'Review your booking payments and transaction history.'}
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
            {payments.length > 0 && (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
                    <div className="flex flex-wrap items-center gap-3">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder="Search hostel, student or transaction…"
                            className="flex-1 min-w-[200px]"
                        />
                        <FilterSelect
                            value={statusFilter}
                            onChange={setStatusFilter}
                            configObject={STATUS_CONFIG}
                            icon={FiFilter}
                            defaultLabel="All Statuses"
                            className="w-full sm:w-auto"
                        />
                        <FilterSelect
                            value={typeFilter}
                            onChange={setTypeFilter}
                            configObject={TYPE_CONFIG}
                            defaultLabel="All Types"
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
            {payments.length === 0 && !error ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mb-4">
                        <FiCreditCard size={24} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No transactions yet</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                        Once payments are initiated or completed, they will appear here.
                    </p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <p className="text-sm text-gray-400">No payments match your filters.</p>
                    <button
                        onClick={() => { setSearch(''); setStatusFilter('ALL'); setTypeFilter('ALL'); setDateFrom(''); setDateTo(''); }}
                        className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginated.map(payment => {
                                        const sc = STATUS_CONFIG[payment.status] || STATUS_CONFIG.PENDING;
                                        const tc = TYPE_CONFIG[payment.payment_type] || TYPE_CONFIG.FULL;
                                        const StatusIcon = sc.icon;
                                        return (
                                            <tr key={payment.payment_id} className="hover:bg-gray-50/60 transition-colors">
                                                {/* Date */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {new Date(payment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </td>

                                                {/* Details */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 shrink-0 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                                            <FiCreditCard size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {isOwner || isAdmin
                                                                    ? `${payment.booking?.student?.first_name || ''} ${payment.booking?.student?.last_name || ''}`
                                                                    : payment.booking?.room?.hostel?.name || `Booking #${payment.booking_id}`}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {isOwner || isAdmin
                                                                    ? payment.booking?.room?.hostel?.name
                                                                    : `${payment.booking?.room?.room_type} Room`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Amount */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm font-bold text-gray-900">Rs. {Number(payment.amount).toLocaleString()}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{payment.payment_method}</p>
                                                </td>

                                                {/* Type */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide ${tc.badge}`}>
                                                        {tc.label}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${sc.badge}`}>
                                                        <StatusIcon size={10} />
                                                        {sc.label}
                                                    </span>
                                                </td>

                                                {/* Transaction ID */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <p className="font-mono text-xs text-gray-700 truncate max-w-[140px] ml-auto">
                                                        {payment.transaction_id || payment.pidx || '—'}
                                                    </p>
                                                    {payment.metadata?.merchant_name && (
                                                        <p className="text-[10px] text-gray-400 mt-0.5">{payment.metadata.merchant_name}</p>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
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
                    </div>
                </>
            )}
        </div>
    );
}
