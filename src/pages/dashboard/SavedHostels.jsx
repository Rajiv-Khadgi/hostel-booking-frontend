import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FaHeart, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { getFriendlyErrorMessage } from '../../utils/errorUtils';

export default function SavedHostels() {
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 6;

    useEffect(() => {
        fetchSavedHostels();
    }, []);

    const fetchSavedHostels = async () => {
        try {
            setLoading(true);
            const response = await api.get('/hostels/saved');
            setHostels(response.data.hostels || []);
            setPage(1);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load saved hostels');
        } finally {
            setLoading(false);
        }
    };

    const filteredHostels = hostels.filter(h => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            h.name?.toLowerCase().includes(s) ||
            h.city?.toLowerCase().includes(s) ||
            h.area?.toLowerCase().includes(s) ||
            h.address?.toLowerCase().includes(s)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filteredHostels.length / PAGE_SIZE));
    const paginatedHostels = filteredHostels.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const handleRemove = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await api.delete(`/hostels/${id}/save`);
            setHostels(hostels.filter(h => h.hostel_id !== id));
            toast.success('Removed from wishlist');
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, 'Failed to remove hostel'));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Saved Hostels</h1>
                <p className="text-gray-500 mt-1 text-sm">Your personal wishlist of properties you're interested in.</p>
            </div>

            {error ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center shadow-sm">
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            ) : hostels.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 mb-6">
                        <FaHeart className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">Start exploring hostels and save the ones you like to view them later.</p>
                    <Link
                        to="/explore"
                        className="mt-8 inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all hover:scale-[1.02]"
                    >
                        Explore Hostels
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder="Search your wishlist..."
                            className="w-full sm:max-w-xs"
                        />
                        <p className="text-sm font-semibold text-gray-700">
                            {filteredHostels.length} saved {filteredHostels.length === 1 ? 'property' : 'properties'} found
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedHostels.map((hostel) => (
                        <Link
                            to={`/hostels/${hostel.hostel_id}`}
                            key={hostel.hostel_id}
                            className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 block relative"
                        >
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                {hostel.images && hostel.images.length > 0 ? (
                                    <img
                                        src={api.defaults.baseURL.replace('/api', '') + hostel.images[0].image_url}
                                        alt={hostel.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                        <FaMapMarkerAlt size={40} />
                                    </div>
                                )}

                                <button
                                    onClick={(e) => handleRemove(e, hostel.hostel_id)}
                                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-red-500 p-2.5 rounded-full shadow-lg hover:bg-red-50 transition-all border border-gray-100"
                                    title="Remove from Saved"
                                >
                                    <FaTrash size={16} />
                                </button>
                            </div>

                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{hostel.name}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1 mb-4">
                                    <FaMapMarkerAlt className="text-emerald-600 flex-shrink-0" size={14} />
                                    <span className="truncate">{hostel.city}, {hostel.area || hostel.address}</span>
                                </p>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                    <div className="text-sm font-bold text-emerald-600">
                                        {hostel.rooms && hostel.rooms.length > 0 ? (
                                            <span>Rs. {Math.min(...hostel.rooms.map(r => Number(r.price)))} <span className="text-gray-400 font-normal text-xs">/mo</span></span>
                                        ) : (
                                            <span className="text-gray-400">Price N/A</span>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 uppercase tracking-tighter">
                                        View Details
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="mt-8">
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            totalItems={filteredHostels.length}
                            pageSize={PAGE_SIZE}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>
            )}
        </div>
    );
}
