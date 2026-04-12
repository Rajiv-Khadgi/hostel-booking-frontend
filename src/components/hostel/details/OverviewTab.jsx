import React from 'react';
import { FiClock, FiShield, FiArrowLeft, FiMapPin, FiStar, FiCheckCircle } from 'react-icons/fi';
import AmenityIcon from '../../AmenityIcon';
import MapComponent from '../../MapComponent';
import { Stars, STAR_PATH } from './Shared';
import { getImageUrl } from '../../../utils/hostelUtils';

export default function OverviewTab({ hostel, reviews, avgRating, setActiveTab, hasMap, imgBase }) {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            {/* About */}
            <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About this property</h2>
                {hostel.description
                    ? <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{hostel.description}</p>
                    : <p className="text-gray-400 italic text-sm">No description provided yet.</p>}
            </div>

            {/* House Rules */}
            <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Good to Know</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                            <FiClock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Check-in / Check-out</p>
                            <p className="text-sm text-gray-500 mt-0.5">Flexible times based on management availability. Please confirm during your visit.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                            <FiShield className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Security & Curfew</p>
                            <p className="text-sm text-gray-500 mt-0.5">24/7 security present. Nighttime curfew policies apply. Check with the owner.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Amenities preview */}
            {hostel.amenities?.length > 0 && (
                <div className="p-8">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-gray-900">Key Amenities</h2>
                        <button onClick={() => setActiveTab('Amenities')}
                            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            Show all <FiArrowLeft className="w-4 h-4 rotate-180" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {hostel.amenities.slice(0, 6).map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-emerald-200 transition-colors">
                                <AmenityIcon icon={item.icon} name={item.name} variant="pill" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Services preview */}
            {hostel.services?.length > 0 && (
                <div className="p-8">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-gray-900">Services</h2>
                        <button onClick={() => setActiveTab('Amenities')}
                            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            Show all <FiArrowLeft className="w-4 h-4 rotate-180" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {hostel.services.slice(0, 6).map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-emerald-200 transition-colors">
                                <AmenityIcon icon={item.icon} name={item.name} variant="pill" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Review snippet */}
            {reviews.length > 0 && (
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg text-sm font-bold text-amber-600 border border-amber-100">
                                <svg className="w-4 h-4 fill-amber-500" viewBox="0 0 20 20"><path d={STAR_PATH} /></svg>
                                {avgRating}
                            </span>
                            <span className="text-sm text-gray-500">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                        </div>
                        <button onClick={() => setActiveTab('Reviews')}
                            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            See all <FiArrowLeft className="w-4 h-4 rotate-180" />
                        </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {reviews.slice(0, 2).map(rev => (
                            <div key={rev.review_id} className="flex flex-col p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold shrink-0 overflow-hidden">
                                        {rev.reviewer?.profile_image
                                            ? <img src={getImageUrl(rev.reviewer.profile_image, imgBase)} className="w-full h-full object-cover" alt="" />
                                            : <span>{rev.reviewer?.first_name?.[0]}{rev.reviewer?.last_name?.[0]}</span>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-900">{rev.reviewer?.first_name} {rev.reviewer?.last_name}</span>
                                            {rev.is_verified && <FiCheckCircle className="text-emerald-500 w-3.5 h-3.5" title="Verified stay" />}
                                        </div>
                                        <Stars n={rev.rating} sz="xs" />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{rev.comments}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Map */}
            {hasMap && (
                <div className="p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Location</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-6">
                        <FiMapPin className="text-emerald-500 shrink-0 w-4 h-4" />
                        {hostel.address}, {hostel.city}{hostel.area ? ` · ${hostel.area}` : ''}
                    </p>
                    <div className="rounded-3xl overflow-hidden border border-gray-200 h-80 shadow-sm">
                        <MapComponent singleHostel={hostel} zoom={15} />
                    </div>
                </div>
            )}
        </div>
    );
}
