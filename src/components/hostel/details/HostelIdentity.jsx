import React from 'react';
import { FiCheckCircle, FiMapPin } from 'react-icons/fi';
import { Stars, TABS } from './Shared';

export default function HostelIdentity({ hostel, avgRating, reviewsCount, activeTab, setActiveTab, gender }) {
    if (!hostel) return null;

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm mb-6">
            {/* Identity */}
            <div className="px-7 pt-7 pb-5">
                <div className="flex flex-wrap gap-2 mb-3">
                    {hostel.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                            <FiCheckCircle className="w-3.5 h-3.5" /> Verified
                        </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${gender.badge}`}>{gender.label}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">{hostel.name}</h1>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                    {avgRating && (
                        <div className="flex items-center gap-2">
                            <Stars n={Math.round(avgRating)} sz="sm" />
                            <span className="font-bold text-gray-800">{avgRating}</span>
                            <span className="text-gray-400">· {reviewsCount} review{reviewsCount !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <FiMapPin className="text-emerald-500 w-4 h-4 shrink-0" />
                        <span className="leading-tight">{hostel.address}, {hostel.city}{hostel.area ? ` (${hostel.area})` : ''}</span>
                    </div>
                </div>
            </div>

            {/* Sticky tab bar */}
            <div className="sticky top-16 z-20 border-t border-gray-100 bg-white rounded-b-3xl">
                <div className="flex overflow-x-auto no-scrollbar">
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`relative flex-shrink-0 px-5 py-4 text-sm font-semibold transition-colors ${activeTab === tab
                                ? 'text-emerald-700'
                                : 'text-gray-400 hover:text-gray-700'
                                }`}>
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
