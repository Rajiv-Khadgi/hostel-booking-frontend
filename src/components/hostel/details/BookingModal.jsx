import React from 'react';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import { inputBase } from './Shared';

export default function BookingModal({ modal, setModal, form, setForm, loading, onSubmit }) {
    if (!modal.isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-none">Confirm Booking</h3>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Request Reservation</p>
                    </div>
                    <button onClick={() => setModal({ isOpen: false, roomId: null, group: null })} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-5">
                    <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50 shrink-0">
                            <FiCheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Selected Unit</p>
                            <p className="text-sm font-bold text-gray-900">{modal.group?.room_type} Sharing Room</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shift Date</label>
                            <input type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className={inputBase} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</label>
                            <select value={form.months} onChange={e => setForm({ ...form, months: e.target.value })} className={inputBase}>
                                <option value="1">1 Month</option>
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={loading}
                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 disabled:opacity-50 flex justify-center items-center transition-all active:scale-[0.98]">
                            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Reservation Request'}
                        </button>
                        <p className="text-center text-[10px] text-gray-400 mt-4 font-medium px-4 leading-relaxed">By clicking confirm, a request will be sent to the property owner. You will be notified once they approve your stay.</p>
                    </div>
                </form>
            </div>
        </div>
    );
}
