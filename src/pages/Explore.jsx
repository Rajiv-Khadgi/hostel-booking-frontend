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
import Pagination from '../components/common/Pagination';

/* ─── constants ─── */
const GENDER_CONFIG = {
    BOYS: { label: 'Boys Only', Icon: FaMale, badge: 'bg-blue-50 text-blue-600 border-blue-100' },
    GIRLS: { label: 'Girls Only', Icon: FaFemale, badge: 'bg-pink-50 text-pink-600 border-pink-100' },
    COED: { label: 'Co-Ed', Icon: FaUserFriends, badge: 'bg-violet-50 text-violet-600 border-violet-100' },
};

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

/* ─── helpers ─── */
const avgRating = (reviews) =>
    reviews?.length
        ? (reviews.reduce((a, r) => a + Number(r.rating), 0) / reviews.length).toFixed(1)
        : null;

const minPrice = (rooms) =>
    rooms?.length ? Math.min(...rooms.map(r => Number(r.price))) : null;

const totalBeds = (rooms) =>
    rooms?.reduce((a, r) => a + r.available_beds, 0) ?? 0;

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
                className={`inline-flex items-center gap-5.5 px-5 py-4 rounded-full border text-sm font-medium transition-all select-none shadow-xs ${active || open
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

            {/* Dropdown panel — Glassmorphism */}
            {open && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 min-w-80 p-6 animate-in fade-in zoom-in duration-200">
                    {children}
                </div>
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
    const PAGE_SIZE = 12;

    const [sortBy, setSortBy] = useState('newest');

    /* Filters */
    const [genderFilter, setGenderFilter] = useState('');
    const [priceMin, setPriceMin] = useState(PRICE_MIN);
    const [priceMax, setPriceMax] = useState(PRICE_MAX);
    const [ratingFilter, setRatingFilter] = useState('');
    const [bedsFilter, setBedsFilter] = useState(0);
    const [amenityFilter, setAmenityFilter] = useState(new Set());

    const debouncedSearch = useDebounce(search, 500);
    const debouncedCity = useDebounce(city, 500);

    const toggleOpen = useCallback((key) =>
        setOpenFilter(prev => prev === key ? null : key), []);

    useEffect(() => {
        fetchHostels();
        if (localStorage.getItem('accessToken')) fetchSavedIds();
    }, [debouncedSearch, debouncedCity]);

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
            if (search) params.append('search', search);
            if (city) params.append('city', city);
            const res = await api.get(`/hostels?${params.toString()}`);
            setHostels(res.data.hostels || []);
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

    /* Unique amenities derived from all hostels */
    const allAmenities = useMemo(() => {
        const map = new Map();
        hostels.forEach(h =>
            [...(h.amenities || []), ...(h.services || [])].forEach(a => {
                if (!map.has(a.name)) map.set(a.name, a);
            })
        );
        return [...map.values()];
    }, [hostels]);

    const budgetActive = priceMin > PRICE_MIN || priceMax < PRICE_MAX;
    const hasActiveFilters = !!(genderFilter || budgetActive || ratingFilter || bedsFilter > 0 || amenityFilter.size > 0);

    const filtered = useMemo(() => {
        let result = hostels.filter(h => {
            if (genderFilter && h.gender_type !== genderFilter) return false;
            const mp = minPrice(h.rooms);
            if (mp !== null && (mp < priceMin || mp > priceMax)) return false;
            const avg = avgRating(h.reviews);
            if (ratingFilter && (avg === null || parseFloat(avg) < parseFloat(ratingFilter))) return false;
            if (bedsFilter > 0 && totalBeds(h.rooms) < bedsFilter) return false;
            if (amenityFilter.size > 0) {
                const names = new Set([...(h.amenities || []), ...(h.services || [])].map(a => a.name));
                for (const n of amenityFilter) if (!names.has(n)) return false;
            }
            return true;
        });

        // Apply Sorting
        switch (sortBy) {
            case 'price_asc':
                result.sort((a, b) => minPrice(a.rooms) - minPrice(b.rooms));
                break;
            case 'price_desc':
                result.sort((a, b) => minPrice(b.rooms) - minPrice(a.rooms));
                break;
            case 'rating':
                result.sort((a, b) => avgRating(b.reviews) - avgRating(a.reviews));
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        return result;
    }, [hostels, genderFilter, priceMin, priceMax, ratingFilter, bedsFilter, amenityFilter, sortBy]);

    useEffect(() => {
        setPage(1);
    }, [search, city, isNearMe, genderFilter, priceMin, priceMax, ratingFilter, bedsFilter, amenityFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handlePageChange = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /* ── Budget pill label ── */
    const budgetLabel = budgetActive
        ? `Rs. ${priceMin > 0 ? priceMin.toLocaleString() : '0'} – ${priceMax < PRICE_MAX ? priceMax.toLocaleString() : `${PRICE_MAX.toLocaleString()}+`}`
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
                            <div className="flex items-center gap-2 p-1 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={handleNearMe}
                                    title={isNearMe ? 'Cancel' : 'Search near me'}
                                    className={`p-3 rounded-xl transition-all ${isNearMe
                                        ? 'bg-red-50 text-red-500 border border-red-100 shadow-sm'
                                        : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent'
                                        }`}
                                >
                                    {isNearMe ? <FiX size={18} /> : <FiNavigation size={18} />}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isNearMe}
                                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-emerald-700/20 transition-all disabled:opacity-40 text-sm tracking-wide"
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
                    <div className="flex flex-wrap items-center justify-center gap-7">
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
                                {allAmenities.map(a => (
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
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50/50 transition-all shadow-xs"
                            >
                                <FiX size={15} /> Clear All
                            </button>
                        )}
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
                ) : filtered.length === 0 ? (
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
                                {filtered.length} {filtered.length === 1 ? 'verified property' : 'verified properties'} found
                                {hasActiveFilters && hostels.length !== filtered.length && (
                                    <span className="text-sm font-semibold text-gray-700"> of {hostels.length} total</span>
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
                                    hostels={filtered}
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
                                    {paginated.map(hostel => {
                                        const coverImg = hostel.images?.find(i => i.is_cover) || hostel.images?.[0];
                                        const gender = GENDER_CONFIG[hostel.gender_type] || GENDER_CONFIG.COED;
                                        const rating = avgRating(hostel.reviews);
                                        const price = minPrice(hostel.rooms);
                                        const beds = totalBeds(hostel.rooms);
                                        const features = [...(hostel.amenities || []), ...(hostel.services || [])].slice(0, 3);

                                        return (
                                            <Link
                                                key={hostel.hostel_id}
                                                to={`/hostels/${hostel.hostel_id}`}
                                                className="group flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                            >
                                                {/* Image Area — 60% */}
                                                <div className="relative overflow-hidden bg-gray-100 h-[284px] shrink-0">
                                                    {coverImg ? (
                                                        <img
                                                            src={api.defaults.baseURL.replace('/api', '') + coverImg.image_url}
                                                            alt={hostel.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-200/50">
                                                            <FiHome size={48} className="text-gray-300" />
                                                        </div>
                                                    )}

                                                    {/* Overlays */}
                                                    <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent" />

                                                    {/* Top Left: Verified Badge */}
                                                    <div className="absolute top-4 left-4">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-[10px] font-semibold text-gray-900 shadow-sm border border-white/50 tracking-wider uppercase">
                                                            <FiCheck size={11} className="text-emerald-600 stroke-[3]" />
                                                            Verified
                                                        </span>
                                                    </div>

                                                    {/* Top Right: Wishlist Heart */}
                                                    <div className="absolute top-4 right-4">
                                                        <button
                                                            onClick={e => handleToggleSave(e, hostel.hostel_id)}
                                                            className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-xl border border-white/50 hover:bg-white transition-all active:scale-90 flex items-center justify-center group/heart"
                                                        >
                                                            <FiHeart
                                                                size={16}
                                                                className={savedIds.has(hostel.hostel_id) ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover/heart:text-red-400'}
                                                            />
                                                        </button>
                                                    </div>

                                                    {/* Bottom Right: Beds Available Badge */}
                                                    <div className="absolute bottom-4 right-4">
                                                        <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-[10px] font-semibold text-emerald-700 shadow-sm border border-emerald-50 tracking-wide uppercase">
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
                                                    </div>

                                                    {/* Footer: Price + CTA */}
                                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-xl font-bold text-gray-900 tracking-tight">₹{Number(price).toLocaleString()}</span>
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
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mb-8">
                                        <Pagination
                                            page={page}
                                            totalPages={totalPages}
                                            totalItems={filtered.length}
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
        </div>
    );
}
