import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';

// Correcting icons to use react-icons/fa or fa6 for consistency with project
import { 
    FaCreditCard as CardIcon, 
    FaHistory as HistoryIcon, 
    FaCheckCircle as CheckIcon, 
    FaClock as ClockIcon, 
    FaTimesCircle as TimesIcon,
    FaExclamationTriangle as ErrorIcon,
    FaSearch as SearchIcon
} from 'react-icons/fa';

export default function Payments() {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const isOwner = user?.role === 'owner';
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchPayments();
    }, [user?.role]);

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
            console.error('Fetch payments error:', err);
            setError(err.response?.data?.error || 'Failed to fetch payment history');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'FAILED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckIcon className="text-emerald-500" />;
            case 'PENDING': return <ClockIcon className="text-amber-500" />;
            case 'FAILED': return <TimesIcon className="text-red-500" />;
            default: return null;
        }
    };

    const filteredPayments = payments.filter(payment => {
        const studentName = (payment.booking?.student?.first_name || '') + ' ' + (payment.booking?.student?.last_name || '');
        const hostelName = payment.booking?.room?.hostel?.name || '';
        const searchStr = (studentName + hostelName + (payment.transaction_id || '') + (payment.pidx || '')).toLowerCase();
        return searchStr.includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-slate-800">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Payment History</h1>
                    <p className="text-gray-500 mt-2">
                        {isAdmin ? 'Complete overview of all transactions in the system.' : isOwner ? 'Track payments received for your properties.' : 'Review your booking payments and transaction history.'}
                    </p>
                </div>
                
                <div className="relative max-w-sm w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <SearchIcon size={14} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all shadow-sm"
                    />
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-3">
                    <ErrorIcon /> {error}
                </div>
            )}

            {!loading && filteredPayments.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                        <HistoryIcon size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No transactions found</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">
                        Once payments are initiated or completed, they will appear here for your records.
                    </p>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="mt-4 text-emerald-600 font-bold hover:underline">
                            Clear search filter
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-auto no-scrollbar max-h-[600px]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredPayments.map((payment) => (
                                    <tr key={payment.payment_id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {new Date(payment.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 shrink-0 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-lg">
                                                    <CardIcon size={18} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {isOwner || isAdmin 
                                                            ? `${payment.booking?.student?.first_name} ${payment.booking?.student?.last_name}`
                                                            : payment.booking?.room?.hostel?.name || 'Booking ID: ' + payment.booking_id
                                                        }
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        {isOwner || isAdmin ? payment.booking?.room?.hostel?.name : payment.booking?.room?.room_type + ' Room'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 whitespace-nowrap text-slate-800">
                                            <div className="text-sm font-extrabold text-gray-900">Rs. {Number(payment.amount).toLocaleString()}</div>
                                            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{payment.payment_method}</div>
                                        </td>

                                        <td className="px-6 py-5 whitespace-nowrap text-center">
                                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 rounded-lg">
                                                {payment.payment_type}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5 whitespace-nowrap text-center">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border shadow-sm ${getStatusStyle(payment.status)}`}>
                                                {getStatusIcon(payment.status)}
                                                {payment.status}
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="text-gray-900 font-mono text-xs">{payment.transaction_id || payment.pidx || 'Pending...'}</div>
                                            {payment.metadata?.merchant_name && (
                                                <div className="text-[10px] text-gray-400 mt-1">{payment.metadata.merchant_name}</div>
                                            )}
                                        </td>
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
