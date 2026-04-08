import React from 'react';
import { FiGrid, FiCamera, FiArrowLeft, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function HostelGallery({ hostel, imgBase, gallery, setGallery, nextImage, prevImage }) {
    const cover = hostel.images?.find(i => i.is_cover) || hostel.images?.[0];
    const extras = hostel.images?.filter(i => i.image_id !== cover?.image_id).slice(0, 4) || [];

    if (!hostel) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className="relative rounded-3xl overflow-hidden bg-gray-100 aspect-[21/9] sm:aspect-[21/7] shadow-lg group">
                {hostel.images?.length > 0 ? (
                    <div className="flex h-full gap-1">
                        {/* Cover image — always visible */}
                        <div className={`h-full overflow-hidden ${extras.length > 0 ? 'w-full md:w-1/2' : 'w-full'}`}>
                            <img src={`${imgBase}${cover.image_url}`} alt={hostel.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                        </div>
                        {/* 2×2 grid — md+ only */}
                        {extras.length > 0 && (
                            <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-1 w-1/2 h-full">
                                {extras.map((img, i) => (
                                    <div key={img.image_id} className="overflow-hidden relative">
                                        <img src={`${imgBase}${img.image_url}`} alt={`photo ${i + 2}`}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                                        {i === 3 && hostel.images.length > 5 && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">+{hostel.images.length - 5} more</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* No photos placeholder */
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400">
                        <FiCamera className="w-14 h-14 opacity-30" />
                        <p className="text-sm font-semibold opacity-50">No photos uploaded yet</p>
                    </div>
                )}

                {/* Show All Photos button */}
                {hostel.images?.length > 0 && (
                    <button onClick={() => setGallery({ isOpen: true, index: 0 })}
                        className="absolute bottom-5 right-5 z-10 flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl text-gray-900 text-sm font-bold border border-white/60 hover:bg-white hover:scale-105 transition-all">
                        <FiGrid className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">Show all photos</span>
                        <span className="sm:hidden">{hostel.images.length} photos</span>
                    </button>
                )}
            </div>

            {/* ═══ LIGHTBOX GALLERY ══════════════════════════════════════════ */}
            {gallery.isOpen && hostel.images?.length > 0 && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-6">
                        <p className="text-white font-semibold text-sm">
                            {gallery.index + 1} / {hostel.images.length}
                        </p>
                        <button onClick={() => setGallery({ isOpen: false, index: 0 })}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 relative flex items-center justify-center p-4 sm:p-12 overflow-hidden">
                        <img src={`${imgBase}${hostel.images[gallery.index].image_url}`}
                            className="max-w-full max-h-full object-contain select-none" alt="" />
                        {hostel.images.length > 1 && (
                            <>
                                <button onClick={prevImage}
                                    className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors transform active:scale-90">
                                    <FiChevronLeft className="w-6 h-6" />
                                </button>
                                <button onClick={nextImage}
                                    className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors transform active:scale-90">
                                    <FiChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
