import React from 'react';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiCalendar, FiHeart, FiLock, FiZap, FiMessageCircle } from 'react-icons/fi';

export default function HostelSidebar({
    minPrice,
    setActiveTab,
    user,
    navigate,
    id,
    setVisitModal,
    hostel,
    ownerInitials,
    ownerName,
    imgBase,
    toggleSave,
    isSaved,
    startChat,
    canMessageOwner
}) {
    return (
        <div className="w-full lg:w-110 shrink-0">
            <div className="sticky top-24">
                <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-100/60 p-6 space-y-5">

                    {/* Price */}
                    <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">Starting from</p>
                        {minPrice
                            ? <div className="flex items-baseline gap-1.5">
                                <p className="text-3xl font-black text-gray-900 tracking-tight">Rs.&nbsp;{minPrice.toLocaleString()}</p>
                                <span className="text-sm font-semibold text-gray-400">/mo</span>
                            </div>
                            : <p className="text-sm text-gray-400 italic">No rooms listed yet</p>
                        }
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-col gap-2.5">
                        <button
                            onClick={() => setActiveTab('Rooms & Pricing')}
                            className="w-full group relative overflow-hidden flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-md shadow-gray-900/20 hover:-translate-y-0.5">
                            <FiCheckCircle className="w-4 h-4 opacity-80" /> Reserve Spot
                        </button>
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
                            className="w-full group flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-all">
                            <FiCalendar className="w-4 h-4" /> Schedule Visit
                        </button>
                        <p className="text-center text-[11px] font-semibold text-gray-400 mt-0.5">You won't be charged yet</p>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Owner */}
                    {hostel.owner && (
                        <div className="space-y-3.5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center overflow-hidden shrink-0 text-emerald-700">
                                    {hostel.owner.profile_image
                                        ? <img src={`${imgBase}/${hostel.owner.profile_image.replace(/^\//, '')}`} className="w-full h-full object-cover" alt="" />
                                        : <span className="font-bold text-sm">{ownerInitials}</span>
                                    }
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{ownerName}</p>
                                    <p className="text-[11px] text-gray-500 font-medium whitespace-nowrap">Property Owner & Customer Consultant</p>
                                </div>
                            </div>
                            {canMessageOwner && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={startChat}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors">
                                        <FiMessageCircle className="w-3.5 h-3.5" /> Message Owner
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <hr className="border-gray-100" />

                    {/* Trust badges */}
                    <div className="space-y-3">
                        <div className="space-y-3">
                            {hostel.status === 'APPROVED' && (
                                <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                                    <FiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>Verified by HomeSpace team</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                                <FiLock className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium tracking-tight">
                                <FiZap className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>Instant response</span>
                            </div>

                            <button onClick={toggleSave}
                                className={`w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${isSaved
                                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-red-200 hover:text-red-500 hover:bg-red-50/40'
                                    }`}>
                                <FiHeart className={`w-4 h-4 transition-all ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                                {isSaved ? 'Saved to Wishlist' : 'Save Property'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
