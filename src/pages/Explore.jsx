import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import MapComponent from '../components/MapComponent';
import AmenityIcon from '../components/AmenityIcon';
import useDebounce from '../hooks/useDebounce';
import { getFriendlyErrorMessage } from '../utils/errorUtils';
import { FaMale, FaFemale, FaUserFriends } from 'react-icons/fa';
import {
    FiSearch, FiMapPin, FiHome, FiNavigation, FiX,
    FiHeart, FiAlertCircle, FiSliders, FiChevronDown, FiCheck, FiUsers, FiStar
} from 'react-icons/fi';
import HostelCard from '../components/common/HostelCard';
import Pagination from '../components/common/Pagination';
import { GENDER_CONFIG, avgRating, minPrice, totalBeds } from '../utils/hostelUtils';

/* ─── constants ─── */
const PRICE_MIN = 0;
const PRICE_MAX = 30000;
const PRICE_STEP = 500;

const RATING_OPTIONS = [
    { value: '', label: 'Any' },
    { value: '3', label: '3★+' },
    { value: '4', label: '4★+' },
    { value: '4.5', label: '4.5★+' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First', icon: FiChevronDown },
    { value: 'price_asc', label: 'Price: Low to High', icon: FiChevronDown },
    { value: 'price_desc', label: 'Price: High to Low', icon: FiChevronDown },
    { value: 'rating', label: 'Top Rated', icon: FiChevronDown },
];

const BEDS_OPTIONS = [
    { value: 0, label: 'Any' },
    { value: 2, label: '2+' },
    { value: 5, label: '5+' },
    { value: 10, label: '10+' },
];

const pct = (val) => ((val - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

/* ─── DualRangeSlider ─── */
function DualRangeSlider({ min, max, step, valueMin, valueMax, onChangeMin, onChangeMax }) {
    const trackRef = useRef(null);
    const leftPct = pct(valueMin);
    const rightPct = pct(valueMax);

    return (
        <div className="relative w-full">
            {/* Track background */}
            <div ref={trackRef} className="relative h-1.5 rounded-full bg-gray-200 mx-1">
                {/* Filled portion */}
                <div
                    className="absolute h-full rounded-full bg-emerald-500"
                    style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
                />
            </div>

            {/* Min handle — Transparent Overlay with specific pointer-events trick */}
            <input
                type="range" min={min} max={max} step={step} value={valueMin}
                onChange={e => {
                    const v = parseInt(e.target.value);
                    if (v < valueMax) onChangeMin(v);
                }}
                className={`absolute inset-0 w-full bg-transparent appearance-none cursor-pointer h-1.5 ${valueMin > max / 1.5 ? 'z-30' : 'z-20'}`}
                style={{
                    pointerEvents: 'none',
                    WebkitAppearance: 'none'
                }}
            />
            {/* Max handle — Transparent Overlay */}
            <input
                type="range" min={min} max={max} step={step} value={valueMax}
                onChange={e => {
                    const v = parseInt(e.target.value);
                    if (v > valueMin) onChangeMax(v);
                }}
                className="absolute inset-0 w-full bg-transparent appearance-none cursor-pointer h-1.5 z-20"
                style={{
                    pointerEvents: 'none',
                    WebkitAppearance: 'none'
                }}
            />

            {/* Logic: Need to add styles for thumbs to have pointer-events auto. 
                In Tailwind/React, we can inject a global style for this component or use a specialized class. */}
            <style dangerouslySetInnerHTML={{
                __html: `
                input[type=range]::-webkit-slider-thumb { pointer-events: auto; width: 24px; height: 24px; -webkit-appearance: none; }
                input[type=range]::-moz-range-thumb { pointer-events: auto; width: 24px; height: 24px; }
            `}} />

            {/* Visible handles */}
            <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 shadow-md pointer-events-none z-30"
                style={{ left: `calc(${leftPct}% - 8px)` }}
            />
            <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 shadow-md pointer-events-none z-30"
                style={{ left: `calc(${rightPct}% - 8px)` }}
            />
        </div>
    );
}

/* ─── FilterPill — the clickable pill button ─── */
function FilterPill({ label, active, open, onClick, onClear, icon: Icon, children }) {
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (!ref.current?.contains(e.target)) onClick(); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, onClick]);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={onClick}
                className={`inline-flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-4 rounded-full border text-xs sm:text-sm font-medium transition-all select-none shadow-xs whitespace-nowrap ${active || open
                    ? 'border-emerald-600 text-gray-900 bg-emerald-50/50 ring-1 ring-emerald-100'
                    : 'border-gray-200 text-gray-900 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
            >
                {Icon && <Icon size={15} className={active || open ? 'text-emerald-600' : 'text-gray-400'} />}
                <span>{label}</span>
                {active && onClear ? (
                    <span
                        role="button"
                        onClick={e => { e.stopPropagation(); onClear(); }}
                        className="ml-1 text-emerald-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                    >
                        <FiX size={14} />
                    </span>
                ) : (
                    <FiChevronDown
                        size={15}
                        className={`transition-transform text-gray-300 ${open ? 'rotate-180' : ''}`}
                    />
                )}
            </button>

            {/* Dropdown panel — Responsive Positioning */}
            {open && (
                <div className="fixed sm:absolute top-1/2 sm:top-full left-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 mt-0 sm:mt-4 z-[100] sm:z-50 bg-white sm:bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-2xl shadow-2xl border border-gray-100 sm:border-white/50 w-[90vw] sm:min-w-80 sm:w-auto p-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4 sm:hidden bg-gray-50 -mx-6 -mt-6 p-4 rounded-t-2xl border-b border-gray-100">
                        <span className="font-bold text-gray-800">{label}</span>
                        <button onClick={onClick} className="p-1 rounded-full hover:bg-gray-200 text-gray-400"><FiX size={18} /></button>
                    </div>
                    {children}
                </div>
            )}
            
            {/* Mobile-only backdrop for open filter */}
            {open && (
                <div className="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]" onClick={onClick} />
            )}
        </div>
    );
}

/* ─── SegPill — tab-style option pill ─── */
function SegPill({ active, onClick, children, activeClass }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border ${active
                ? activeClass ?? 'bg-white shadow-md text-emerald-700 border-gray-100 scale-[1.02]'
                : 'border-transparent text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/50'
                }`}
        >
            {children}
        </button>
    );
}

/* ═══════════════════════════════════════════════════════ */
export default function Explore() {
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [city, setCity] = useState('');
    const [savedIds, setSavedIds] = useState(new Set());
    const [viewMode, setViewMode] = useState('list');
    const [radius, setRadius] = useState(5);
    const [isNearMe, setIsNearMe] = useState(false);
    const [userLoc, setUserLoc] = useState(null);
    const [openFilter, setOpenFilter] = useState(null); // 'budget'|'gender'|'rating'|'beds'|'amenities'|null
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const PAGE_SIZE = 12;

    const [sortBy, setSortBy] = useState('newest');

    /* Filters */
    const [genderFilter, setGenderFilter] = useState('');
    const [priceMin, setPriceMin] = useState(PRICE_MIN);
    const [priceMax, setPriceMax] = useState(PRICE_MAX);
    const [ratingFilter, setRatingFilter] = useState('');
    const [bedsFilter, setBedsFilter] = useState(0);
    const [amenityFilter, setAmenityFilter] = useState(new Set());

    /* Metadata */
    const [globalAmenities, setGlobalAmenities] = useState([]);
    const [globalMaxPrice, setGlobalMaxPrice] = useState(PRICE_MAX);

    const debouncedSearch = useDebounce(search, 500);
    const debouncedCity = useDebounce(city, 500);
    const debouncedPriceMin = useDebounce(priceMin, 500);
    const debouncedPriceMax = useDebounce(priceMax, 500);

    const toggleOpen = useCallback((key) =>
        setOpenFilter(prev => prev === key ? null : key), []);

    useEffect(() => {
        api.get('/hostels/metadata').then(res => {
            if (res.data.success) {
                setGlobalAmenities(res.data.amenities || []);
                setGlobalMaxPrice(res.data.maxPrice || PRICE_MAX);
                setPriceMax(prev => prev === PRICE_MAX ? (res.data.maxPrice || PRICE_MAX) : prev);
            }
        }).catch(() => {});
        
        if (localStorage.getItem('accessToken')) fetchSavedIds();
    }, []);

    useEffect(() => {
        if (!isNearMe) fetchHostels();
    }, [debouncedSearch, debouncedCity, genderFilter, debouncedPriceMin, debouncedPriceMax, ratingFilter, bedsFilter, amenityFilter, sortBy, page]);

    const fetchSavedIds = async () => {
        try {
            const res = await api.get('/hostels/saved');
            setSavedIds(new Set(res.data.hostels.map(h => h.hostel_id)));
        } catch { /* non-critical */ }
    };

    const fetchHostels = async () => {
        try {
            setLoading(true);
            setIsNearMe(false);
            const params = new URLSearchParams();
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (debouncedCity) params.append('city', debouncedCity);
            if (genderFilter) params.append('gender_type', genderFilter);
            if (debouncedPriceMin > PRICE_MIN) params.append('minPrice', debouncedPriceMin);
            if (debouncedPriceMax < globalMaxPrice) params.append('maxPrice', debouncedPriceMax);
            if (ratingFilter) params.append('rating', ratingFilter);
            if (bedsFilter > 0) params.append('beds', bedsFilter);
            if (amenityFilter.size > 0) params.append('amenities', Array.from(amenityFilter).join(','));
            params.append('sortBy', sortBy);
            params.append('page', page);
            params.append('limit', PAGE_SIZE);

            const res = await api.get(`/hostels?${params.toString()}`);
            setHostels(res.data.hostels || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalItems(res.data.totalItems || 0);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load hostels');
        } finally {
            setLoading(false);
        }
    };

    const fetchNearbyHostels = async (lat, lng, rad) => {
        try {
            setLoading(true);
            const res = await api.get(`/hostels/nearby?lat=${lat}&lng=${lng}&radius=${rad}`);
            setHostels(res.data.hostels || []);
            setTotalPages(1);
            setTotalItems(res.data.hostels?.length || 0);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch nearby hostels');
        } finally {
            setLoading(false);
        }
    };

    const handleNearMe = () => {
        if (isNearMe) {
            setIsNearMe(false); setUserLoc(null); setViewMode('list'); fetchHostels(); return;
        }
        if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords: { latitude, longitude } }) => {
                setUserLoc({ lat: latitude, lng: longitude });
                setIsNearMe(true); setViewMode('map');
                setSearch(''); setCity('');
                fetchNearbyHostels(latitude, longitude, radius);
            },
            () => { setError('Location access denied.'); setLoading(false); }
        );
    };

    useEffect(() => {
        if (isNearMe && userLoc) fetchNearbyHostels(userLoc.lat, userLoc.lng, radius);
    }, [radius]);

    const handleToggleSave = async (e, id) => {
        e.preventDefault(); e.stopPropagation();
        if (!localStorage.getItem('accessToken')) {
            toast.error('Please login to save hostels');
            return;
        }
        const isSaved = savedIds.has(id);
        try {
            if (isSaved) {
                await api.delete(`/hostels/${id}/save`);
                setSavedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
                toast.success('Removed from wishlist');
            } else {
                await api.post(`/hostels/${id}/save`);
                setSavedIds(prev => new Set(prev).add(id));
                toast.success('Saved to wishlist!');
            }
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, 'Failed to update wishlist'));
        }
    };

    const clearFilters = () => {
        setGenderFilter(''); setPriceMin(PRICE_MIN); setPriceMax(PRICE_MAX);
        setRatingFilter(''); setBedsFilter(0); setAmenityFilter(new Set());
    };

    const handleClearSearch = () => {
        setSearch(''); setCity(''); setIsNearMe(false); setViewMode('list');
        clearFilters(); fetchHostels();
    };

    const toggleAmenity = (name) => {
        setAmenityFilter(prev => {
            const next = new Set(prev);
            next.has(name) ? next.delete(name) : next.add(name);
            return next;
        });
    };

    const budgetActive = priceMin > PRICE_MIN || priceMax < globalMaxPrice;
    const hasActiveFilters = !!(genderFilter || budgetActive || ratingFilter || bedsFilter > 0 || amenityFilter.size > 0);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, debouncedCity, isNearMe, genderFilter, debouncedPriceMin, debouncedPriceMax, ratingFilter, bedsFilter, amenityFilter]);

    const handlePageChange = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /* ── Budget pill label ── */
    const budgetLabel = budgetActive
        ? `Rs. ${priceMin > 0 ? priceMin.toLocaleString() : '0'} – ${priceMax < globalMaxPrice ? priceMax.toLocaleString() : `${globalMaxPrice.toLocaleString()}+`}`
        : 'Budget';

    return (
        <div className="bg-gray-50 min-h-screen pb-16">

            {/* ── Hero ── */}
            <div className="relative bg-linear-to-br from-emerald-900 via-emerald-700 to-teal-600 overflow-hidden pb-24">
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
                />
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-teal-400 rounded-full blur-3xl opacity-20 pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-300 rounded-full blur-3xl opacity-15 pointer-events-none" />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3">
                        Discover Your Perfect Stay
                    </h1>
                    <p className="text-emerald-100/70 text-base mb-10 max-w-xl mx-auto">
                        Explore verified hostels and student residences across Nepal with ease.
                    </p>

                    {/* Universal Search Bar */}
                    <div className="bg-white rounded-2xl shadow-2xl p-1.5 flex flex-col sm:flex-row items-center gap-1">
                        <form
                            onSubmit={e => { e.preventDefault(); fetchHostels(); }}
                            className="flex-1 flex flex-col sm:flex-row items-center w-full"
                        >
                            {/* Search area */}
                            <div className="flex-1 flex items-center w-full px-3 py-1">
                                <FiSearch size={18} className="text-emerald-500 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Hostel name or location…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    disabled={isNearMe}
                                    className="flex-1 px-3 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-semibold text-gray-800 placeholder-gray-400 disabled:opacity-40"
                                />
                            </div>

                            <div className="hidden sm:block w-px h-8 bg-gray-100 mx-2" />

                            {/* Radius OR City */}
                            {isNearMe ? (
                                <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full">
                                    <FiSliders size={15} className="text-emerald-500 shrink-0" />
                                    <span className="text-xs text-gray-500 font-bold whitespace-nowrap">Radius</span>
                                    <input
                                        type="range" min="1" max="50" value={radius}
                                        onChange={e => setRadius(parseInt(e.target.value))}
                                        className="flex-1 accent-emerald-600 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 min-w-14 text-center">
                                        {radius} km
                                    </span>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center w-full px-3 py-1">
                                    <FiMapPin size={18} className="text-emerald-500 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={city}
                                        onChange={e => setCity(e.target.value)}
                                        className="flex-1 px-3 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-semibold text-gray-800 placeholder-gray-400"
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 p-1 w-full sm:w-auto mt-2 sm:mt-0">
                                <button
                                    type="button"
                                    onClick={handleNearMe}
                                    title={isNearMe ? 'Cancel' : 'Search near me'}
                                    className={`p-3.5 sm:p-3 rounded-xl transition-all ${isNearMe
                                        ? 'bg-red-50 text-red-500 border border-red-100 shadow-sm'
                                        : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent flex-1 sm:flex-none flex items-center justify-center'
                                        }`}
                                >
                                    {isNearMe ? <FiX size={18} /> : <div className="flex items-center gap-2"><FiNavigation size={18} /><span className="sm:hidden text-sm font-semibold">Near Me</span></div>}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isNearMe}
                                    className="flex-[2] sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 sm:py-3 rounded-xl shadow-lg shadow-emerald-700/20 transition-all disabled:opacity-40 text-sm tracking-wide"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                    {isNearMe && (
                        <p className="flex items-center justify-center gap-2 text-xs text-white/80 font-semibold py-3 drop-shadow-sm">
                            <FiNavigation size={12} className="animate-pulse" />
                            Showing results within {radius} km of your location
                        </p>
                    )}
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">

                {/* ── Filter Bar ── */}
                <div className="flex flex-col items-center gap-6 mb-12">
                    {/* Interactive Pills + Clear */}
                    <div className="w-full relative px-4">
                        <div className="flex overflow-x-auto lg:overflow-visible items-center lg:justify-center gap-3 sm:gap-7 pb-4 sm:pb-0 no-scrollbar">
                            {/* Sort By */}
                            <FilterPill
                                label={SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                                icon={SORT_OPTIONS.find(o => o.value === sortBy)?.icon}
                                active={sortBy !== 'newest'}
                                open={openFilter === 'sort'}
                                onClick={() => toggleOpen('sort')}
                            >
                                <p className="text-sm font-semibold text-gray-700 mb-3">Sort Results By</p>
                                <div className="grid grid-cols-1 gap-1">
                                    {SORT_OPTIONS.map(o => (
                                        <button
                                            key={o.value}
                                            onClick={() => { setSortBy(o.value); setOpenFilter(null); }}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${sortBy === o.value
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <o.icon size={14} className={sortBy === o.value ? 'text-emerald-600' : 'text-gray-300'} />
                                            {o.label}
                                        </button>
                                    ))}
                                </div>
                            </FilterPill>

                            {/* Budget */}
                            <FilterPill
                                label={budgetLabel}
                                icon={FiSliders}
                                active={budgetActive}
                                open={openFilter === 'budget'}
                                onClick={() => toggleOpen('budget')}
                                onClear={() => { setPriceMin(PRICE_MIN); setPriceMax(PRICE_MAX); }}
                            >
                                <p className="text-sm font-semibold text-gray-700 mb-5">Budget Range</p>
                                <div className="mb-6 px-1">
                                    <DualRangeSlider
                                        min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP}
                                        valueMin={priceMin} valueMax={priceMax}
                                        onChangeMin={setPriceMin} onChangeMax={setPriceMax}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Min Price</label>
                                        <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 focus-within:border-emerald-300 transition-colors">
                                            <span className="text-xs font-bold text-gray-400">₹</span>
                                            <input
                                                type="number"
                                                value={priceMin}
                                                onChange={e => setPriceMin(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-bold text-gray-800 p-0"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Max Price</label>
                                        <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 focus-within:border-emerald-300 transition-colors">
                                            <span className="text-xs font-bold text-gray-400">₹</span>
                                            <input
                                                type="number"
                                                value={priceMax}
                                                onChange={e => setPriceMax(Math.min(PRICE_MAX, parseInt(e.target.value) || 0))}
                                                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-bold text-gray-800 p-0"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button onClick={() => { setPriceMin(PRICE_MIN); setPriceMax(PRICE_MAX); }} className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-wide">Reset</button>
                                    <button onClick={() => setOpenFilter(null)} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-700/10 uppercase tracking-wide">Apply</button>
                                </div>
                            </FilterPill>

                            {/* Gender */}
                            <FilterPill
                                label={genderFilter ? GENDER_CONFIG[genderFilter]?.label : 'Gender'}
                                icon={genderFilter ? GENDER_CONFIG[genderFilter]?.Icon : FiUsers}
                                active={!!genderFilter}
                                open={openFilter === 'gender'}
                                onClick={() => toggleOpen('gender')}
                                onClear={() => setGenderFilter('')}
                            >
                                <p className="text-sm font-semibold text-gray-700 mb-4">Gender Preference</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <SegPill active={!genderFilter} onClick={() => setGenderFilter('')}>Everyone</SegPill>
                                    {Object.entries(GENDER_CONFIG).map(([key, cfg]) => (
                                        <button
                                            key={key}
                                            onClick={() => setGenderFilter(genderFilter === key ? '' : key)}
                                            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all ${genderFilter === key
                                                ? `${cfg.badge.replace('bg-', 'bg-').split(' ')[0]} border-emerald-200 shadow-sm shadow-emerald-600/5`
                                                : 'bg-gray-50 border-transparent text-gray-500 hover:bg-white hover:border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${genderFilter === key ? 'bg-white' : 'bg-gray-200/50'}`}>
                                                    <cfg.Icon size={16} />
                                                </div>
                                                <span className="text-sm font-bold">{cfg.label}</span>
                                            </div>
                                            {genderFilter === key && <FiCheck size={16} className="text-emerald-600" />}
                                        </button>
                                    ))}
                                </div>
                            </FilterPill>

                            {/* Rating */}
                            <FilterPill
                                label={ratingFilter ? `${ratingFilter}★ & above` : 'Rating'}
                                icon={FiStar}
                                active={!!ratingFilter}
                                open={openFilter === 'rating'}
                                onClick={() => toggleOpen('rating')}
                                onClear={() => setRatingFilter('')}
                            >
                                <p className="text-sm font-semibold text-gray-700 mb-4">Hostel Rating</p>
                                <div className="flex flex-wrap gap-2">
                                    {RATING_OPTIONS.map(o => (
                                        <SegPill key={o.value} active={ratingFilter === o.value} onClick={() => setRatingFilter(o.value)}>
                                            <div className="flex items-center gap-1.5">
                                                {o.value && <FiStar size={12} className={ratingFilter === o.value ? 'fill-emerald-600 text-emerald-600' : 'text-gray-300'} />}
                                                {o.label}
                                            </div>
                                        </SegPill>
                                    ))}
                                </div>
                            </FilterPill>

                            {/* Beds */}
                            <FilterPill
                                label={bedsFilter > 0 ? `${bedsFilter}+ Beds` : 'Capacity'}
                                icon={FiHome}
                                active={bedsFilter > 0}
                                open={openFilter === 'beds'}
                                onClick={() => toggleOpen('beds')}
                                onClear={() => setBedsFilter(0)}
                            >
                                <p className="text-sm font-semibold text-gray-700 mb-4">Minimum Bed Capacity</p>
                                <div className="flex flex-wrap gap-2">
                                    {BEDS_OPTIONS.map(o => (
                                        <SegPill key={o.value} active={bedsFilter === o.value} onClick={() => setBedsFilter(o.value)}>
                                            {o.label} beds
                                        </SegPill>
                                    ))}
                                </div>
                            </FilterPill>

                            {/* More Filters / Amenities */}
                            <FilterPill
                                label={amenityFilter.size > 0 ? `Features (${amenityFilter.size})` : 'Amenities'}
                                icon={FiSliders}
                                active={amenityFilter.size > 0}
                                open={openFilter === 'amenities'}
                                onClick={() => toggleOpen('amenities')}
                                onClear={() => setAmenityFilter(new Set())}
                            >
                                <p className="text-sm font-semibold text-gray-700 mb-4">Amenities & Services</p>
                                <div className="grid grid-cols-2 gap-2 max-w-sm">
                                    {globalAmenities.map(a => (
                                        <button
                                            key={a.name}
                                            onClick={() => toggleAmenity(a.name)}
                                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all ${amenityFilter.has(a.name)
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]'
                                                : 'bg-white text-gray-500 border-gray-100 hover:border-emerald-300 hover:text-emerald-600'
                                                }`}
                                        >
                                            <AmenityIcon icon={a.icon} name={a.name} variant="pill" />
                                        </button>
                                    ))}
                                </div>
                            </FilterPill>

                            {/* Clear Action — Now Inline */}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 bg-white text-xs sm:text-sm font-bold text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50/50 transition-all shadow-xs whitespace-nowrap"
                                >
                                    <FiX size={15} /> Clear All
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Results ── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-56 bg-white rounded-2xl shadow-sm border border-gray-100 gap-3">
                        <div className="w-9 h-9 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                        <p className="text-sm text-gray-400">Searching for hostels…</p>
                    </div>
                ) : error ? (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-5">
                        <FiAlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                ) : totalItems === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-14 text-center">
                        <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mb-4">
                            <FiSearch size={22} className="text-emerald-500" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">No hostels found</h3>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">
                            {hasActiveFilters
                                ? 'No hostels match the active filters. Try loosening them.'
                                : 'Try adjusting your search or increasing the radius.'}
                        </p>
                        {isNearMe && userLoc && (
                            <div className="mb-6 max-w-2xl mx-auto h-100 rounded-2xl overflow-hidden border border-gray-100 relative">
                                <MapComponent hostels={[]} center={[userLoc.lat, userLoc.lng]} userLocation={userLoc} zoom={14} height="100%" />
                                <div className="absolute top-4 left-4 z-400 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm text-sm font-medium text-red-600 border border-red-100">
                                    No properties within {radius} km
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleClearSearch}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                            <FiX size={13} /> Reset all
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-sm font-bold text-gray-900 tracking-tight">
                                {totalItems} {totalItems === 1 ? 'verified property' : 'verified properties'} found
                                {hasActiveFilters && (
                                    <span className="text-sm font-semibold text-gray-700"> matching your filters</span>
                                )}
                            </p>
                            <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200 gap-0.5">
                                {['list', 'map'].map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={`px-5 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${viewMode === mode
                                            ? 'bg-white text-emerald-700 shadow-sm border border-gray-200'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {mode} View
                                    </button>
                                ))}
                            </div>
                        </div>

                        {viewMode === 'map' ? (
                            <div className="w-full h-150 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                                <MapComponent
                                    hostels={hostels}
                                    center={userLoc ? [userLoc.lat, userLoc.lng] : [27.7172, 85.3240]}
                                    userLocation={userLoc}
                                    zoom={14}
                                    height="100%"
                                />
                                {isNearMe && (
                                    <div className="absolute top-4 left-4 z-400 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm text-sm font-medium text-emerald-800 border border-emerald-100">
                                        Showing within {radius} km
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {hostels.map(hostel => (
                                        <HostelCard 
                                            key={hostel.hostel_id} 
                                            hostel={hostel} 
                                            savedIds={savedIds} 
                                            handleToggleSave={handleToggleSave} 
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mb-8">
                                        <Pagination
                                            page={page}
                                            totalPages={totalPages}
                                            totalItems={totalItems}
                                            pageSize={PAGE_SIZE}
                                            onPageChange={setPage}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Floating View Toggle for Mobile */}
            <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transform active:scale-95 transition-transform">
                <button
                    onClick={() => {
                        const nextMode = viewMode === 'map' ? 'list' : 'map';
                        setViewMode(nextMode);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-gray-900 text-white rounded-full font-bold shadow-2xl shadow-gray-900/40 text-sm whitespace-nowrap border border-gray-800"
                >
                    {viewMode === 'map' ? (
                        <div className="flex items-center gap-2">
                             <FiLayout size={18} className="text-emerald-400" />
                             <span>Show List Results</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                             <FiMapPin size={18} className="text-emerald-400" />
                             <span>Show Map Explorer</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
