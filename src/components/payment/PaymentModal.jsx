import React, { useState, useEffect } from 'react';
import { FaTimes, FaWallet, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function PaymentModal({ isOpen, onClose, booking, type, onConfirm, loading }) {
    const [amount, setAmount] = useState('');
    const [months, setMonths] = useState(1);
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');

    const roomPrice = booking?.room?.price || 0;
    const totalCost = (booking?.months || 0) * roomPrice;
    
    // Calculate paid amount excluding failed payments
    const paidAmount = booking?.payments?.filter(p => p.status === 'COMPLETED').reduce((acc, p) => acc + Number(p.amount), 0) || 0;
    const remainingBalance = Math.max(0, totalCost - paidAmount);
    const minDeposit = Math.floor(totalCost * 0.1);

    // Reset state when modal opens or type changes
    useEffect(() => {
        if (!isOpen) return;
        
        setError('');
        setWarning('');
        if (type === 'DEPOSIT') {
            setAmount(minDeposit);
        } else if (type === 'MONTHLY') {
            setMonths(1);
            setAmount(Math.min(roomPrice, remainingBalance));
        } else if (type === 'BALANCE') {
            setAmount(remainingBalance);
        }
    }, [isOpen, type, minDeposit, roomPrice, remainingBalance]);

    if (!isOpen) return null;

    const handleAmountChange = (val) => {
        const numVal = parseFloat(val) || 0;
        setAmount(val);
        setWarning('');
        
        if (numVal > remainingBalance + 0.1) { 
            setError(`Amount exceeds remaining balance (Rs. ${remainingBalance.toLocaleString()})`);
        } else if (type === 'DEPOSIT' && numVal < minDeposit) {
            setError(`Minimum deposit is Rs. ${minDeposit.toLocaleString()}`);
        } else {
            setError('');
        }
    };

    const handleMonthsChange = (val) => {
        const m = parseInt(val) || 1;
        setMonths(m);
        const calculated = m * roomPrice;
        const finalAmount = Math.min(calculated, remainingBalance);
        setAmount(finalAmount);
        
        setError('');
        if (calculated > remainingBalance + 0.1) {
            setWarning(`Selected months exceed balance. Paying remaining Rs. ${remainingBalance.toLocaleString()}`);
        } else {
            setWarning('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (error) return; 
        onConfirm({ amount, months, type });
    };

    const getTitle = () => {
        switch (type) {
            case 'DEPOSIT': return 'Pay Security Deposit';
            case 'MONTHLY': return 'Pay Monthly Rent';
            case 'BALANCE': return 'Pay Remaining Balance';
            default: return 'Process Payment';
        }
    };

    const isAmountEditable = type === 'DEPOSIT';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative px-6 py-6 pb-2">
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <FaTimes />
                    </button>
                    <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 shadow-sm shadow-emerald-50">
                        <FaWallet className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{getTitle()}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                        Room <b>{booking?.room?.room_number}</b> • {booking?.room?.hostel?.name}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
                    {/* Multi-Month Selector */}
                    {type === 'MONTHLY' && (
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Duration</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 3, 6].map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => handleMonthsChange(m)}
                                        className={`py-3 rounded-2xl text-sm font-bold border transition-all ${months === m ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300'}`}
                                    >
                                        {m}{m === 1 ? ' Mo' : ' Mos'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Amount Input */}
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                            {type === 'MONTHLY' ? 'Calculated Amount' : 'Payment Amount'}
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
                            <input 
                                type="number" 
                                value={amount}
                                readOnly={!isAmountEditable}
                                onChange={(e) => handleAmountChange(e.target.value)}
                                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-xl transition-all ${!isAmountEditable ? 'opacity-70 cursor-not-allowed border-gray-100' : (error ? 'border-red-300 ring-red-100 ring-4' : 'border-gray-100 focus:bg-white')}`}
                                placeholder="0.00"
                            />
                        </div>
                        {error && (
                            <p className="mt-3 text-[11px] text-red-500 flex items-start gap-2 font-bold leading-tight bg-red-50 p-2 rounded-lg border border-red-100">
                                <FaExclamationTriangle className="mt-0.5 shrink-0" /> {error}
                            </p>
                        )}
                        {warning && !error && (
                            <p className="mt-3 text-[11px] text-amber-600 flex items-start gap-2 font-bold leading-tight bg-amber-50 p-2 rounded-lg border border-amber-100">
                                <FaInfoCircle className="mt-0.5 shrink-0" /> {warning}
                            </p>
                        )}
                        {type === 'DEPOSIT' && !error && !warning && (
                            <p className="mt-3 text-[10px] text-gray-400 font-medium flex items-center gap-1.5 px-1 uppercase tracking-wider">
                                <FaInfoCircle className="text-emerald-500" /> Minimum 10% is Rs. {minDeposit.toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium tracking-tight">Total Booking Cost</span>
                            <span className="text-gray-900 font-bold">Rs. {totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium tracking-tight">Total Paid So Far</span>
                            <span className="text-emerald-600 font-bold">Rs. {paidAmount.toLocaleString()}</span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-gray-200/60 flex justify-between items-center bg-white -mx-4 -mb-4 px-4 py-3 rounded-b-2xl">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">New Balance</span>
                            <span className="text-sm text-gray-900 font-black">Rs. {Math.max(0, remainingBalance - (parseFloat(amount) || 0)).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Action */}
                    <button 
                        type="submit"
                        disabled={loading || error || !amount}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-emerald-200/50"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <FaWallet className="text-sm opacity-80" />
                                Proceed to Khalti
                            </>
                        )}
                    </button>
                    
                    <p className="text-[10px] text-center text-gray-400 uppercase font-black tracking-[0.2em] flex items-center justify-center gap-2">
                         Secure Checkout <FaCheckCircle className="text-emerald-500 text-xs" />
                    </p>
                </form>
            </div>
        </div>
    );
}
