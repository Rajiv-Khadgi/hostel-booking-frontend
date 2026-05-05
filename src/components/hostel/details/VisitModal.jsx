import React from 'react';
import { FiX, FiCalendar } from 'react-icons/fi';
import { inputBase } from './Shared';

export default function VisitModal({ isOpen, onClose, date, setDate, loading, onSubmit }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-none">Schedule a Visit</h3>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Property Discovery</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-6">
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                            <FiCalendar className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-blue-700 font-medium leading-relaxed">Choose a preferred date. The owner will coordinate a specific time slot via chat or phone.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preferred Visit Date</label>
                        <input type="date" required
                            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                            value={date} onChange={e => setDate(e.target.value)}
                            className={inputBase} />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-200 disabled:opacity-50 flex justify-center items-center transition-all">
                            {loading
                                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <>
                                    <FiCalendar className="w-4 h-4 mr-1.5" /> Confirm Visit
                                </>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
