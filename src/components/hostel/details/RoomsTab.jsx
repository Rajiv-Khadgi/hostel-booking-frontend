import React from 'react';
import { FaBed } from 'react-icons/fa';
import { SectionCard, ROOM_CFG } from './Shared';

export default function RoomsTab({ grouped, openBooking }) {
    return (
        <div className="space-y-4">
            {grouped.length === 0 ? (
                <SectionCard className="p-16 text-center">
                    <FaBed className="text-5xl text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-semibold text-sm">No rooms listed yet</p>
                    <p className="text-gray-300 text-xs mt-1">Check back later for availability</p>
                </SectionCard>
            ) : grouped.map((g, i) => {
                const cfg = ROOM_CFG[g.room_type] || ROOM_CFG.SINGLE;
                const isFull = g.avail === 0;
                return (
                    <SectionCard key={i} className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Icon block */}
                            <div className={`w-16 h-16 rounded-2xl ${cfg.bg} border ${cfg.border} flex flex-col items-center justify-center gap-1 shrink-0`}>
                                <FaBed className={`text-2xl ${cfg.iconColor}`} />
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 className="font-bold text-gray-900">{cfg.label} Room</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isFull ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                        }`}>
                                        {isFull ? 'Full' : `${g.avail} / ${g.total} available`}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-1">{g.description || `Spacious ${cfg.label.toLowerCase()} sharing room with all basic facilities.`}</p>
                            </div>

                            {/* Price + CTA */}
                            <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 shrink-0">
                                <div className="text-right">
                                    <p className="text-2xl font-black text-emerald-600 leading-none">
                                        Rs.&nbsp;{Number(g.price).toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">per month</p>
                                </div>
                                <button
                                    onClick={() => openBooking(g)}
                                    disabled={isFull}
                                    className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${isFull
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5'
                                        }`}
                                >
                                    {isFull ? 'Full' : 'Book Now'}
                                </button>
                            </div>
                        </div>
                    </SectionCard>
                );
            })}
        </div>
    );
}
