import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiCheck, FiHeart, FiMapPin } from 'react-icons/fi';
import api from '../../api/axios';
import AmenityIcon from '../AmenityIcon';
import { GENDER_CONFIG, avgRating, minPrice, totalBeds, getImageUrl } from '../../utils/hostelUtils';

export default function HostelCard({ hostel, savedIds = new Set(), handleToggleSave }) {
    const coverImg = hostel.images?.find(i => i.is_cover) || hostel.images?.[0];
    const gender = GENDER_CONFIG[hostel.gender_type] || GENDER_CONFIG.COED;
    const rating = avgRating(hostel.reviews);
    const price = minPrice(hostel.rooms);
    const beds = totalBeds(hostel.rooms);
    const allFeatures = [...(hostel.amenities || []), ...(hostel.services || [])];
    const features = allFeatures.slice(0, 4);
    const overflow = allFeatures.length > 4 ? allFeatures.length - 4 : 0;

    return (
        <Link
            to={`/hostels/${hostel.hostel_id}`}
            className="group flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
            {/* Image Area — 60% */}
            <div className="relative overflow-hidden bg-gray-100 h-[284px] shrink-0">
                {coverImg ? (
                    <img
                        src={getImageUrl(coverImg.image_url, api.defaults.baseURL)}
                        alt={hostel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200/50">
                        <FiHome size={48} className="text-gray-300" />
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                {/* Top Left: Verified Badge */}
                <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-semibold text-gray-900 shadow-sm border border-white/50 tracking-wider uppercase">
                        <FiCheck size={11} className="text-emerald-600 stroke-[3]" />
                        Verified
                    </span>
                </div>

                {/* Top Right: Wishlist Heart */}
                {handleToggleSave && (
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={e => handleToggleSave(e, hostel.hostel_id)}
                            className="p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-white/50 hover:bg-white transition-all active:scale-90 flex items-center justify-center group/heart"
                        >
                            <FiHeart
                                size={16}
                                className={savedIds.has(hostel.hostel_id) ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover/heart:text-red-400'}
                            />
                        </button>
                    </div>
                )}

                {/* Bottom Right: Beds Available Badge */}
                <div className="absolute bottom-4 right-4">
                    <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-semibold text-emerald-700 shadow-sm border border-emerald-50 tracking-wide uppercase">
                        {beds} beds available
                    </span>
                </div>
            </div>

            {/* Content Area — 40% */}
            <div className="p-6 flex flex-col flex-1 min-h-[180px] bg-white">
                {/* Header: Title + Rating */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors line-clamp-1 tracking-tight">
                        {hostel.name}
                    </h3>
                    {rating && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 border border-emerald-100">
                            <span className="text-[10px] font-bold">★</span>
                            <span className="text-[11px] font-semibold">{rating}</span>
                        </div>
                    )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5 font-medium">
                    <FiMapPin size={13} className="shrink-0 text-gray-300" />
                    <span className="truncate">
                        {[hostel.area, hostel.city].filter(Boolean).join(', ') || hostel.address}
                    </span>
                </div>

                {/* Tags: Gender + Top Features */}
                <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold border tracking-wide uppercase transition-colors ${gender.badge}`}>
                        <gender.Icon size={12} />
                        {gender.label}
                    </span>
                    {features.map(f => (
                        <AmenityIcon
                            key={f.amenity_id ?? f.service_id ?? f.name}
                            icon={f.icon}
                            name={f.name}
                            variant="pill"
                        />
                    ))}
                    {overflow > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-500 min-w-[32px] hover:bg-gray-100 transition-colors cursor-default">
                            +{overflow}
                        </span>
                    )}
                </div>

                {/* Footer: Price + CTA */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-gray-900 tracking-tight">₹{price !== null ? Number(price).toLocaleString() : 'N/A'}</span>
                            <span className="text-[10px] text-gray-400 font-medium tracking-tight uppercase">/month</span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium mt-1 leading-none">
                            {hostel.reviews?.length || 0} reviews
                        </p>
                    </div>
                    <div className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-emerald-100 hover:shadow-lg hover:bg-emerald-800 transition-all hover:scale-[1.02] active:scale-95">
                        View Details
                    </div>
                </div>
            </div>
        </Link>
    );
}
