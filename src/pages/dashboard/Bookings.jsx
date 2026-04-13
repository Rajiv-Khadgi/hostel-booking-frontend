import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import PaymentModal from '../../components/payment/PaymentModal';
import SearchBar from '../../components/common/SearchBar';
import FilterSelect from '../../components/common/FilterSelect';
import Pagination from '../../components/common/Pagination';
import { getFriendlyErrorMessage } from '../../utils/errorUtils';
import {
    FiBookmark, FiFilter, FiCheck, FiX,
    FiAlertCircle, FiCalendar
} from 'react-icons/fi';

const STATUS_CONFIG = {
    REQUESTED: { label: 'Requested', badge: 'bg-amber-100 text-amber-700 border-amber-200'      },
    APPROVED:  { label: 'Approved',  badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    CONFIRMED: { label: 'Confirmed', badge: 'bg-blue-100 text-blue-700 border-blue-200'          },
    REJECTED:  { label: 'Rejected',  badge: 'bg-red-100 text-red-700 border-red-200'             },
    CANCELLED: { label: 'Cancelled', badge: 'bg-gray-100 text-gray-600 border-gray-200'          },
    COMPLETED: { label: 'Completed', badge: 'bg-teal-100 text-teal-700 border-teal-200'          },
};

const PAYMENT_STATUS_CONFIG = {
    UNPAID:  { label: 'Unpaid',  badge: 'bg-gray-100 text-gray-500'        },
    PARTIAL: { label: 'Partial', badge: 'bg-amber-100 text-amber-700'       },
    PAID:    { label: 'Paid',    badge: 'bg-emerald-100 text-emerald-700'   },
};

const PAGE_SIZE = 8;

export default function Bookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [paymentModal, setPaymentModal] = useState({ isOpen: false, booking: null, type: null });
    const [confirmAction, setConfirmAction] = useState({ isOpen: false, bookingId: null, status: null });

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [paymentFilter, setPaymentFilter] = useState('ALL');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);

    const isOwner = user?.role === 'owner' || user?.role === 'admin';

    useEffect(() => { fetchBookings(); }, [user?.role]);

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
        try {
            setActionLoading(bookingId);
            await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
            setBookings(prev => prev.map(b => b.booking_id === bookingId ? { ...b, status: newStatus } : b));
            toast.success(`Booking ${newStatus.toLowerCase()} successfully`);
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, `Failed to ${newStatus.toLowerCase()} booking`));
        } finally {
            setActionLoading(null);
        }
    };

    const handlePayment = (bookingId, type) => {
        const booking = bookings.find(b => b.booking_id === bookingId);
        if (booking) setPaymentModal({ isOpen: true, booking, type });
    };

    const confirmPayment = async ({ amount, months, type }) => {
        const bookingId = paymentModal.booking.booking_id;
        try {
            setActionLoading(`${bookingId}-${type}`);
            const res = await api.post('/payments/initiate', { bookingId, paymentType: type, amount, months });
            if (res.data.pidx) {
                sessionStorage.setItem('lastPaymentPidx', res.data.pidx);
            }
            if (res.data.payment_url) window.location.href = res.data.payment_url;
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, 'Payment failed'));
        } finally {
            setActionLoading(null);
            setPaymentModal({ isOpen: false, booking: null, type: null });
        }
    };

    const filtered = useMemo(() => {
        return bookings.filter(b => {
            const hostelName = b.room?.hostel?.name?.toLowerCase() || '';
            const studentName = `${b.student?.first_name || ''} ${b.student?.last_name || ''}`.toLowerCase();
            const matchesSearch = !search || hostelName.includes(search.toLowerCase()) || studentName.includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
            const matchesPayment = paymentFilter === 'ALL' || b.payment_status === paymentFilter;
            const bookingDate = b.start_date ? new Date(b.start_date) : null;
            const matchesFrom = !dateFrom || (bookingDate && bookingDate >= new Date(dateFrom));
            const matchesTo = !dateTo || (bookingDate && bookingDate <= new Date(dateTo));
            return matchesSearch && matchesStatus && matchesPayment && matchesFrom && matchesTo;
        });
    }, [bookings, search, statusFilter, paymentFilter, dateFrom, dateTo]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handlePageChange = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => { setPage(1); }, [search, statusFilter, paymentFilter, dateFrom, dateTo]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                    </div>
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest animate-pulse">Loading bookings…</p>
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
                            Bookings
                        </span>
                        {bookings.length > 0 && (
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                                {bookings.length} total
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {isOwner ? 'Manage Bookings' : 'My Bookings'}
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        {isOwner ? 'Review and manage booking requests for your properties.' : 'Track the status of your room booking requests.'}
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
            {bookings.length > 0 && (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
                    <div className="flex flex-wrap items-center gap-3">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder={isOwner ? 'Search hostel or student…' : 'Search hostel…'}
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
                        <FilterSelect
                            value={paymentFilter}
                            onChange={setPaymentFilter}
                            configObject={PAYMENT_STATUS_CONFIG}
                            defaultLabel="All Payments"
                            className="w-full sm:w-auto"
                        />
                        <div className="flex flex-col sm:flex-row items-center gap-2 px-3 py-2 sm:py-1 bg-gray-50/50 hover:bg-gray-50 transition-colors rounded-xl border border-gray-100/50 w-full sm:w-auto">
                            <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 shrink-0">
                                <FiCalendar size={13} className="text-gray-400" /> Date Range:
                            </span>
                            <div className="flex items-center gap-2 w-full">
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={e => setDateFrom(e.target.value)}
                                    className="flex-1 sm:w-28 px-2 py-1.5 rounded-lg border-0 bg-transparent text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium min-w-0"
                                />
                                <span className="text-xs text-gray-400 font-bold">→</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    min={dateFrom}
                                    onChange={e => setDateTo(e.target.value)}
                                    className="flex-1 sm:w-28 px-2 py-1.5 rounded-lg border-0 bg-transparent text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium min-w-0"
                                />
                            </div>
                            {(dateFrom || dateTo) && (
                                <button
                                    onClick={() => { setDateFrom(''); setDateTo(''); }}
                                    className="sm:ml-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors active:scale-95 whitespace-nowrap"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {bookings.length === 0 && !error ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mb-4">
                        <FiBookmark size={24} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No bookings yet</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                        {isOwner ? "You don't have any booking requests yet." : "You haven't requested any bookings yet."}
                    </p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <p className="text-sm text-gray-400">No bookings match your filters.</p>
                    <button
                        onClick={() => { setSearch(''); setStatusFilter('ALL'); setPaymentFilter('ALL'); setDateFrom(''); setDateTo(''); }}
                        className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Mobile View (Cards) */}
                        <div className="block md:hidden">
                            <div className="grid grid-cols-1 divide-y divide-gray-100">
                                {paginated.map(booking => {
                                    const sc = STATUS_CONFIG[booking.status] || STATUS_CONFIG.REQUESTED;
                                    const pc = PAYMENT_STATUS_CONFIG[booking.payment_status] || PAYMENT_STATUS_CONFIG.UNPAID;
                                    return (
                                        <div key={booking.booking_id} className="p-4 flex flex-col gap-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                                                        {booking.room?.hostel?.name?.[0]?.toUpperCase() || 'H'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 leading-tight">{booking.room?.hostel?.name}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{booking.room?.room_type} · #{booking.room?.room_number}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${sc.badge}`}>
                                                        {sc.label}
                                                    </span>
                                                    {booking.payment_status && (
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${pc.badge}`}>
                                                            {pc.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Duration</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                                                        <FiCalendar size={12} className="text-emerald-500" />
                                                        {new Date(booking.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(booking.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                    </div>
                                                </div>
                                                {isOwner && (
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Student</p>
                                                        <p className="text-xs font-semibold text-gray-900 truncate">
                                                            {booking.student?.first_name} {booking.student?.last_name}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-1">
                                                <div>
                                                    {!isOwner && (booking.status === 'APPROVED' || booking.status === 'CONFIRMED') && booking.payment_status !== 'PAID' && (
                                                        <p className="text-[10px] text-gray-400 font-bold">
                                                            Paid Rs. {(booking.payments?.filter(p => p.status === 'COMPLETED').reduce((a, p) => a + Number(p.amount), 0) || 0).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    {isOwner ? (
                                                        booking.status === 'REQUESTED' && (
                                                            <>
                                                                <button
                                                                    onClick={() => setConfirmAction({ isOpen: true, bookingId: booking.booking_id, status: 'APPROVED' })}
                                                                    disabled={actionLoading === booking.booking_id}
                                                                    className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 transition-all active:scale-95"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmAction({ isOpen: true, bookingId: booking.booking_id, status: 'REJECTED' })}
                                                                    disabled={actionLoading === booking.booking_id}
                                                                    className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 border border-red-100 transition-all active:scale-95"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )
                                                    ) : (
                                                        (booking.status === 'APPROVED' || booking.status === 'CONFIRMED') && booking.payment_status !== 'PAID' && (
                                                            <div className="flex gap-1.5">
                                                                <button onClick={() => handlePayment(booking.booking_id, 'MONTHLY')} className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                    Monthly
                                                                </button>
                                                                <button onClick={() => handlePayment(booking.booking_id, 'BALANCE')} className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm border border-emerald-600">
                                                                    Pay Balance
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Desktop View (Table) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                                        {isOwner && <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>}
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginated.map(booking => {
                                        const sc = STATUS_CONFIG[booking.status] || STATUS_CONFIG.REQUESTED;
                                        const pc = PAYMENT_STATUS_CONFIG[booking.payment_status] || PAYMENT_STATUS_CONFIG.UNPAID;
                                        return (
                                            <tr key={booking.booking_id} className="hover:bg-gray-50/60 transition-colors">
                                                {/* Property */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 shrink-0 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-sm">
                                                            {booking.room?.hostel?.name?.[0]?.toUpperCase() || 'H'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{booking.room?.hostel?.name}</p>
                                                            <p className="text-xs text-gray-400">{booking.room?.room_type} · Room #{booking.room?.room_number}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Student (owner view) */}
                                                {isOwner && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <p className="text-sm font-medium text-gray-900">{booking.student?.first_name} {booking.student?.last_name}</p>
                                                        <p className="text-xs text-gray-400">{booking.student?.email}</p>
                                                    </td>
                                                )}

                                                {/* Duration */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                                        <FiCalendar size={12} className="text-gray-400" />
                                                        {new Date(booking.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-0.5 pl-4">
                                                        → {new Date(booking.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {booking.months}mo
                                                    </p>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`inline-flex w-fit px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${sc.badge}`}>
                                                            {sc.label}
                                                        </span>
                                                        {booking.payment_status && (
                                                            <span className={`inline-flex w-fit px-2 py-0.5 rounded-full text-[10px] font-medium ${pc.badge}`}>
                                                                {pc.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    {isOwner ? (
                                                        booking.status === 'REQUESTED' ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => setConfirmAction({ isOpen: true, bookingId: booking.booking_id, status: 'APPROVED' })}
                                                                    disabled={actionLoading === booking.booking_id}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                                                                >
                                                                    <FiCheck size={12} /> Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmAction({ isOpen: true, bookingId: booking.booking_id, status: 'REJECTED' })}
                                                                    disabled={actionLoading === booking.booking_id}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                                                                >
                                                                    <FiX size={12} /> Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">Handled</span>
                                                        )
                                                    ) : (
                                                        (booking.status === 'APPROVED' || booking.status === 'CONFIRMED') && booking.payment_status !== 'PAID' ? (
                                                            <div className="flex flex-col items-end gap-2">
                                                                <p className="text-[10px] text-gray-400 font-medium">
                                                                    Paid Rs. {(booking.payments?.filter(p => p.status === 'COMPLETED').reduce((a, p) => a + Number(p.amount), 0) || 0).toLocaleString()} / Rs. {(booking.months * (booking.room?.price || 0)).toLocaleString()}
                                                                </p>
                                                                <div className="flex gap-1.5">
                                                                    {booking.payment_status === 'UNPAID' && (
                                                                        <button onClick={() => handlePayment(booking.booking_id, 'DEPOSIT')} className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                                                            Deposit
                                                                        </button>
                                                                    )}
                                                                    <button onClick={() => handlePayment(booking.booking_id, 'MONTHLY')} className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                                                                        Monthly
                                                                    </button>
                                                                    <button onClick={() => handlePayment(booking.booking_id, 'BALANCE')} className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm">
                                                                        Balance
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : booking.payment_status === 'PAID' ? (
                                                            <span className="text-xs font-semibold text-emerald-600">Fully Paid</span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">Pending Approval</span>
                                                        )
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

            <PaymentModal
                isOpen={paymentModal.isOpen}
                onClose={() => setPaymentModal({ isOpen: false, booking: null, type: null })}
                booking={paymentModal.booking}
                type={paymentModal.type}
                loading={actionLoading}
                onConfirm={confirmPayment}
            />

            <ConfirmModal
                isOpen={confirmAction.isOpen}
                onClose={() => setConfirmAction({ isOpen: false, bookingId: null, status: null })}
                onConfirm={() => handleStatusChange(confirmAction.bookingId, confirmAction.status)}
                title={confirmAction.status === 'APPROVED' ? 'Approve Booking' : 'Reject Booking'}
                message={`Are you sure you want to ${confirmAction.status?.toLowerCase()} this booking?`}
                confirmText={confirmAction.status === 'APPROVED' ? 'Approve' : 'Reject'}
                variant={confirmAction.status === 'APPROVED' ? 'info' : 'danger'}
            />
        </div>
    );
}
