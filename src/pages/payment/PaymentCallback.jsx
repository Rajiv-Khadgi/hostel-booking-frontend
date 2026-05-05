import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaSpinner } from 'react-icons/fa';

export default function PaymentCallback() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your payment with Khalti...');
    const [resolvedPidx, setResolvedPidx] = useState('');
    const [callbackIncomplete, setCallbackIncomplete] = useState(false);

    const pidx = searchParams.get('pidx');
    const transactionId = searchParams.get('transaction_id');
    const amount = searchParams.get('amount');
    const purchaseOrderName = searchParams.get('purchase_order_name');

    const resolvePidx = () => {
        const queryPidx = searchParams.get('pidx');
        if (queryPidx) return queryPidx;

        // Some providers put values in URL hash instead of query string.
        const hash = window.location.hash || '';
        const hashContent = hash.startsWith('#') ? hash.slice(1) : hash;
        const hashParams = new URLSearchParams(hashContent.includes('?') ? hashContent.split('?')[1] : hashContent);
        const hashPidx = hashParams.get('pidx');
        if (hashPidx) return hashPidx;

        const storedPidx = sessionStorage.getItem('lastPaymentPidx');
        return storedPidx || '';
    };

    useEffect(() => {
        const nextPidx = resolvePidx();
        if (!nextPidx) {
            setStatus('error');
            setCallbackIncomplete(true);
            setMessage('Payment callback is incomplete (missing payment ID). Please check your booking status and retry verification from the booking page.');
            return;
        }

        setResolvedPidx(nextPidx);
        verifyPayment(nextPidx);
    }, [pidx]);

    const verifyPayment = async (pidxToVerify = resolvedPidx) => {
        if (!pidxToVerify) {
            setStatus('error');
            setCallbackIncomplete(true);
            setMessage('Payment callback is incomplete (missing payment ID).');
            return;
        }

        try {
            setStatus('verifying');
            setCallbackIncomplete(false);
            const response = await api.get(`/payments/verify?pidx=${pidxToVerify}`);
            
            if (response.data.success) {
                setStatus('success');
                setMessage('Payment Successful! Your booking has been confirmed.');
                sessionStorage.removeItem('lastPaymentPidx');
            } else {
                setStatus('error');
                setMessage(response.data.message || 'Payment verification failed.');
            }
        } catch (err) {
            console.error('Verification error:', err);
            setStatus('error');
            setMessage(err.response?.data?.error || 'An error occurred during payment verification.');
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="h-20 w-20 border-4 border-emerald-100 rounded-full"></div>
                            <FaSpinner className="h-20 w-20 text-emerald-600 animate-spin absolute top-0 left-0" />
                        </div>
                        <h2 className="mt-8 text-2xl font-bold text-gray-900">Processing Payment</h2>
                        <p className="mt-2 text-gray-600">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                            <FaCheckCircle className="h-12 w-12" />
                        </div>
                        <h2 className="mt-8 text-2xl font-bold text-gray-900">Success!</h2>
                        <p className="mt-2 text-emerald-600 font-medium">{message}</p>
                        
                        <div className="mt-8 w-full bg-gray-50 rounded-2xl p-4 text-left border border-gray-100">
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-500">Transaction ID:</span>
                                <span className="text-gray-900 font-mono">{transactionId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-500">Amount Paid:</span>
                                <span className="text-gray-900 font-bold">Rs. {amount ? (amount / 100).toLocaleString() : '...'}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-500">Order:</span>
                                <span className="text-gray-900">{purchaseOrderName || 'Room Booking'}</span>
                            </div>
                        </div>

                        <Link 
                            to="/dashboard/bookings" 
                            className="mt-8 w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                        >
                            Return to My Bookings
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <FaExclamationTriangle className="h-10 w-10" />
                        </div>
                        <h2 className="mt-8 text-2xl font-bold text-gray-900">Payment Failed</h2>
                        <p className="mt-2 text-red-600 font-medium">{message}</p>

                        {!callbackIncomplete && (
                            <p className="mt-6 text-sm text-gray-500">
                                If your amount was deducted, please don't worry. It will be refunded within 24 hours or you can contact support.
                            </p>
                        )}

                        <div className="mt-8 flex gap-3 w-full">
                            <Link 
                                to="/dashboard/bookings" 
                                className="flex-1 py-4 border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                                <FaArrowLeft className="text-xs" /> Back
                            </Link>
                            <button 
                                onClick={() => verifyPayment()} 
                                className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
