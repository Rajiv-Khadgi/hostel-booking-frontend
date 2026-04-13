import React from 'react';
import toast from 'react-hot-toast';
import { FiCalendar, FiCheckCircle } from 'react-icons/fi';

export default function MobileActions({ user, id, navigate, setVisitModal, setActiveTab }) {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 pb-8 flex gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
            <button
                onClick={() => {
                    if (!user) {
                        navigate('/login', { state: { from: `/hostels/${id}` } });
                        return;
                    }
                    if (user.role !== 'student') {
                        toast.error('Only students can schedule visits.');
                        return;
                    }
                    setVisitModal({ isOpen: true });
                }}
                className="flex-[0.8] flex items-center justify-center gap-2 py-3.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-colors active:scale-95">
                <FiCalendar className="w-4 h-4" /> Visit
            </button>
            <button
                onClick={() => { window.scrollTo({ top: 400, behavior: 'smooth' }); setActiveTab('Rooms & Pricing'); }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
                <FiCheckCircle className="w-4 h-4 opacity-80" /> Book Now
            </button>
        </div>
    );
}
