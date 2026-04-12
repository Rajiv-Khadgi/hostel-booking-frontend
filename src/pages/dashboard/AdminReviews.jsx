import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import ConfirmModal from '../../components/common/ConfirmModal';
import { getFriendlyErrorMessage } from '../../utils/errorUtils';
import { 
    FaStar, 
    FaTrash, 
    FaUser, 
    FaBuilding,
    FaQuoteLeft,
    FaCalendarAlt
} from 'react-icons/fa';

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, reviewId: null });
    const PAGE_SIZE = 10;

    useEffect(() => { setPage(1); }, [search]);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/reviews');
            setReviews(res.data.reviews);
        } catch (err) {
            setError('Failed to fetch reviews');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await api.delete(`/admin/reviews/${reviewId}`);
            setReviews(reviews.filter(r => r.review_id !== reviewId));
            toast.success('Review deleted successfully');
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, 'Failed to delete review'));
        } finally {
            setConfirmDelete({ isOpen: false, reviewId: null });
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar key={i} className={i < rating ? 'text-amber-500' : 'text-gray-200'} size={14} />
        ));
    };

    const filteredReviews = reviews.filter(r => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            r.hostel?.name?.toLowerCase().includes(s) ||
            r.reviewer?.first_name?.toLowerCase().includes(s) ||
            r.reviewer?.last_name?.toLowerCase().includes(s) ||
            r.reviewer?.email?.toLowerCase().includes(s) ||
            r.comments?.toLowerCase().includes(s)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));
    const paginatedReviews = filteredReviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handlePageChange = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Review Moderation</h1>
                    <p className="text-gray-500 mt-2">Monitor system-wide feedback and remove inappropriate content.</p>
                </div>
                <SearchBar 
                    value={search} 
                    onChange={setSearch} 
                    placeholder="Search reviews..." 
                    className="w-full md:w-80"
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">{error}</div>
            ) : reviews.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                        <FaStar size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews found</h3>
                    <p className="text-gray-500">Your platform hasn't received any reviews yet.</p>
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                        <FaSearch size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-500">No reviews matched your search criteria.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {paginatedReviews.map((review) => (
                            <div key={review.review_id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                                        <FaUser size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{review.reviewer?.first_name} {review.reviewer?.last_name}</div>
                                        <div className="text-xs text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-37.5">{review.reviewer?.email}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {review.is_flagged && (
                                        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-tight">Flagged</span>
                                    )}
                                    <button 
                                        onClick={() => setConfirmDelete({ isOpen: true, reviewId: review.review_id })}
                                        className="p-2 text-red-600 bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                                        title="Delete Review"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>

                            {review.is_flagged && (
                                <div className="mb-4 bg-red-50/50 border border-red-100 rounded-2xl p-3 text-xs text-red-700 italic">
                                    <span className="font-bold not-italic mr-1">Report Reason:</span> {review.flag_reason || 'No reason provided'}
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                                <div className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                                    <FaCalendarAlt size={12} /> {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="bg-gray-50/80 rounded-2xl p-4 relative mb-4 italic text-gray-700 text-sm leading-6">
                                <FaQuoteLeft className="text-gray-200 absolute -top-2 -left-2" size={24} />
                                "{review.comments}"
                            </div>

                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg border border-emerald-100">
                                <FaBuilding size={12} /> {review.hostel?.name}
                            </div>
                        </div>
                    ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <Pagination 
                            page={page} 
                            totalPages={totalPages} 
                            totalItems={filteredReviews.length} 
                            pageSize={PAGE_SIZE} 
                            onPageChange={setPage} 
                        />
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, reviewId: null })}
                onConfirm={() => handleDeleteReview(confirmDelete.reviewId)}
                title="Delete Review"
                message="Are you sure you want to delete this review? This action is permanent and cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
