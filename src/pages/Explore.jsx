import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Explore() {
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [city, setCity] = useState('');
    const [savedIds, setSavedIds] = useState(new Set());
    const { user } = api.defaults.headers.common['Authorization'] ? { user: true } : { user: null }; // Simplified check for user status or useAuth if available

    useEffect(() => {
        fetchHostels();
        if (localStorage.getItem('accessToken')) {
            fetchSavedIds();
        }
    }, [search, city]);

    const fetchSavedIds = async () => {
        try {
            const response = await api.get('/hostels/saved');
            const ids = new Set(response.data.hostels.map(h => h.hostel_id));
            setSavedIds(ids);
        } catch (err) {
            console.error('Failed to fetch saved IDs', err);
        }
    };

    const fetchHostels = async () => {
        try {
            setLoading(true);

            // Build query string
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (city) params.append('city', city);

            const response = await api.get(`/hostels?${params.toString()}`);
            setHostels(response.data.hostels || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load hostels');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSave = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();

        if (!localStorage.getItem('accessToken')) {
            alert('Please login to save hostels');
            return;
        }

        const isSaved = savedIds.has(id);

        try {
            if (isSaved) {
                await api.delete(`/hostels/${id}/save`);
                const newIds = new Set(savedIds);
                newIds.delete(id);
                setSavedIds(newIds);
            } else {
                await api.post(`/hostels/${id}/save`);
                const newIds = new Set(savedIds);
                newIds.add(id);
                setSavedIds(newIds);
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Action failed');
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchHostels();
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header / Search Section */}
            <div className="bg-emerald-700 pb-16 pt-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold shadow-sm text-white tracking-tight mb-4">
                        Discover Your Perfect Stay
                    </h1>
                    <p className="text-emerald-100 max-w-2xl mx-auto text-lg mb-8">
                        Explore premium student residences and verified hostels near your university.
                    </p>

                    <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or area..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3 border-transparent bg-transparent focus:ring-0 focus:border-transparent text-gray-900 placeholder-gray-500 rounded-xl"
                            />
                        </div>
                        <div className="hidden sm:block w-px bg-gray-200 my-2"></div>
                        <div className="flex-1 relative border-t sm:border-t-0 border-gray-100">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3 border-transparent bg-transparent focus:ring-0 focus:border-transparent text-gray-900 placeholder-gray-500 rounded-xl"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-emerald-600 text-white font-medium px-8 py-3 rounded-xl shadow-sm hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
                        <p className="text-gray-500">Searching for hostels...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center shadow-sm">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                ) : hostels.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 mb-4">
                            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No hostels found</h3>
                        <p className="text-gray-500">Try adjusting your search criteria or location to find more results.</p>
                        <button
                            onClick={() => { setSearch(''); setCity(''); }}
                            className="mt-6 inline-flex items-center px-4 py-2 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h2 className="text-lg font-bold text-emerald-900">{hostels.length} {hostels.length === 1 ? 'Property' : 'Properties'} Available</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {hostels.map((hostel) => (
                                <Link to={`/hostels/${hostel.hostel_id}`} key={hostel.hostel_id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">

                                    {/* Image Container */}
                                    <div className="h-56 bg-gray-100 relative overflow-hidden">
                                        {hostel.images && hostel.images.length > 0 ? (
                                            <img src={api.defaults.baseURL.replace('/api', '') + hostel.images[0].image_url} alt={hostel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
                                                <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Save Button */}
                                        <button
                                            onClick={(e) => handleToggleSave(e, hostel.hostel_id)}
                                            className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 transition-all active:scale-95 group/save"
                                        >
                                            <svg
                                                className={`w-5 h-5 transition-colors ${savedIds.has(hostel.hostel_id) ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover/save:text-red-400'}`}
                                                viewBox="0 0 24 24"
                                                fill={savedIds.has(hostel.hostel_id) ? "currentColor" : "none"}
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>

                                        {/* Price Badge */}
                                        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm font-bold text-gray-900 text-sm">
                                            {hostel.rooms && hostel.rooms.length > 0 ? (
                                                <span>From NPR {Math.min(...hostel.rooms.map(r => Number(r.price)))} <span className="text-gray-500 font-normal text-xs">/mo</span></span>
                                            ) : (
                                                <span>Price unavailable</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2 gap-2">
                                            <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors line-clamp-1">{hostel.name}</h3>
                                            {hostel.reviews && hostel.reviews.length > 0 && (
                                                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md shrink-0">
                                                    <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    <span className="text-xs font-bold text-amber-700">
                                                        {(hostel.reviews.reduce((acc, rev) => acc + Number(rev.rating), 0) / hostel.reviews.length).toFixed(1)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5 line-clamp-1">
                                            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {hostel.address}, {hostel.city}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                                            {/* Amenities preview */}
                                            {hostel.amenities && hostel.amenities.slice(0, 3).map(amenity => (
                                                <span key={amenity.amenity_id} className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md shrink-0 border border-gray-100">
                                                    {amenity.name}
                                                </span>
                                            ))}
                                            {hostel.amenities && hostel.amenities.length > 3 && (
                                                <span className="text-xs font-medium text-gray-500 px-1 shrink-0">
                                                    +{hostel.amenities.length - 3} more
                                                </span>
                                            )}
                                        </div>

                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
