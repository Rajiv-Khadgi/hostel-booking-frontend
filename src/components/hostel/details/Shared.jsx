import React from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

export const TABS = ['Overview', 'Rooms & Pricing', 'Amenities', 'Reviews'];

export const ROOM_CFG = {
    SINGLE: { label: 'Single', accent: 'emerald', iconColor: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    DOUBLE: { label: 'Double', accent: 'blue', iconColor: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    TRIPLE: { label: 'Triple', accent: 'violet', iconColor: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
    DORM: { label: 'Dormitory', accent: 'amber', iconColor: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
};

export const GENDER_CFG = {
    BOYS: { label: 'Boys Only', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
    GIRLS: { label: 'Girls Only', badge: 'bg-pink-100 text-pink-700 border-pink-200' },
    COED: { label: 'Co-Ed', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

export const inputBase = "w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all";

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

export const Stars = ({ n = 0, sz = 'sm' }) => {
    const dim = sz === 'lg' ? 'w-5 h-5' : sz === 'sm' ? 'w-3.5 h-3.5' : 'w-3 h-3';
    return (
        <span className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} className={`${dim} ${i <= n ? 'fill-amber-400' : 'fill-gray-200'}`} viewBox="0 0 20 20">
                    <path d={STAR_PATH} />
                </svg>
            ))}
        </span>
    );
};

export const SectionCard = ({ children, className = '' }) => (
    <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm ${className}`}>
        {children}
    </div>
);

export const SectionTitle = ({ children }) => (
    <h2 className="text-lg font-bold text-gray-900 mb-5">{children}</h2>
);
