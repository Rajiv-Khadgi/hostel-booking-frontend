import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import InputModal from '../../components/common/InputModal';
import { getFriendlyErrorMessage } from '../../utils/errorUtils';
import { getImageUrl } from '../../utils/hostelUtils';
import { FaStar, FaReply, FaFlag, FaSearch, FaUndo } from 'react-icons/fa';

export default function HostelReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [flagModal, setFlagModal] = useState({ isOpen: false, reviewId: null });
    const PAGE_SIZE = 10;

    useEffect(() => {
        setPage(1);
    }, [search]);

    useEffect(() => {
        fetchOwnerReviews();
    }, []);

    const getDisplayDate = (value) => {
        if (!value) return 'Recently';
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? 'Recently' : parsed.toLocaleDateString();
    };

    const getAvatarSrc = (profileImage) => {
        return getImageUrl(profileImage, api.defaults.baseURL);
    };

    const fetchOwnerReviews = async () => {
        try {
            setLoading(true);
            const hostelsRes = await api.get('/hostels/my-hostels');
            const hostels = hostelsRes.data.hostels || [];

            let allReviews = [];
            for (const hostel of hostels) {
                const reviewsRes = await api.get(`/reviews/hostel/${hostel.hostel_id}`);
                const hostelReviews = reviewsRes.data.reviews.map((r) => ({ ...r, hostel_name: hostel.name }));
                allReviews = [...allReviews, ...hostelReviews];
            }

            allReviews.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
            setReviews(allReviews);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmittingReply(true);
            await api.patch(`/reviews/${replyingTo}/reply`, { reply: replyText });
            setReplyingTo(null);
            setReplyText('');
            fetchOwnerReviews();
            toast.success('Reply posted successfully!');
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, 'Failed to post reply'));
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleFlagReview = async (reviewId, reason) => {
        try {
            await api.patch(`/reviews/${reviewId}/flag`, { reason });
            fetchOwnerReviews();
            toast.success('Review has been flagged for moderation.');
            setFlagModal({ isOpen: false, reviewId: null });
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, 'Failed to flag review'));
        }
    };

    const handleUnflagReview = async (reviewId) => {
        try {
            await api.patch(`/reviews/${reviewId}/unflag`);
            fetchOwnerReviews();
            toast.success('Review restored successfully.');
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, 'Failed to restore review'));
        }
    };

    const filteredReviews = reviews.filter((r) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            r.hostel_name?.toLowerCase().includes(s) ||
            r.reviewer?.first_name?.toLowerCase().includes(s) ||
            r.reviewer?.last_name?.toLowerCase().includes(s) ||
            r.comments?.toLowerCase().includes(s)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));
    const paginatedReviews = filteredReviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Property Reviews</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage feedback from students and respond to their reviews.</p>
                </div>
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search reviews..."
                    className="w-full md:w-72 mt-4 md:mt-0"
                />
            </div>

            {error ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center shadow-sm">
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            ) : reviews.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 mb-6">
                        <FaStar className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">Once students start reviewing your properties, they will appear here.</p>
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 mb-6">
                        <FaSearch className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">No reviews matched your search criteria.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {paginatedReviews.map((review) => (
                        <div key={review.review_id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                                        {review.reviewer?.profile_image ? (
                                            <img
                                                src={getAvatarSrc(review.reviewer.profile_image)}
                                                className="w-full h-full object-cover"
                                                alt={review.reviewer.first_name}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-emerald-50 font-bold" style={{ color: '#047857' }}>
                                                {review.reviewer?.first_name?.[0]}{review.reviewer?.last_name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{review.reviewer?.first_name} {review.reviewer?.last_name}</h3>
                                                <p className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded inline-block mt-1">
                                                    {review.hostel_name}
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {getDisplayDate(review.created_at || review.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex text-amber-400 my-2">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        {review.is_verified && (
                                            <div className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                                                Verified stay
                                            </div>
                                        )}
                                        <p className="text-gray-600 text-sm leading-relaxed">{review.comments}</p>

                                        {review.reply ? (
                                            <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 border-l-4">
                                                <p className="text-xs font-bold text-emerald-900 mb-1 flex items-center gap-2">
                                                    <FaReply className="scale-x-[-1]" /> Your Response
                                                </p>
                                                <p className="text-sm text-emerald-800 leading-relaxed">{review.reply}</p>
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(review.review_id);
                                                        setReplyText(review.reply);
                                                    }}
                                                    className="text-[10px] text-emerald-600 mt-2 font-bold hover:underline"
                                                >
                                                    Edit Response
                                                </button>
                                            </div>
                                        ) : replyingTo !== review.review_id && (
                                            <button
                                                onClick={() => setReplyingTo(review.review_id)}
                                                className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                            >
                                                <FaReply className="scale-x-[-1]" /> Write a Response
                                            </button>
                                        )}

                                        {replyingTo === review.review_id && (
                                            <form onSubmit={handleReplySubmit} className="mt-4 space-y-3">
                                                <textarea
                                                    required
                                                    autoFocus
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write your response to the student..."
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm min-h-20"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        disabled={submittingReply}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                                    >
                                                        {submittingReply ? 'Sending...' : 'Post Response'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setReplyingTo(null);
                                                            setReplyText('');
                                                        }}
                                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                                <div className="border-t md:border-t-0 md:border-l border-gray-50 pt-4 md:pt-0 md:pl-6 shrink-0 flex md:flex-col items-start gap-2">
                                    {review.is_flagged ? (
                                        <button
                                            onClick={() => handleUnflagReview(review.review_id)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors"
                                            title="Restore review visibility"
                                        >
                                            <FaUndo size={12} />
                                            Restore
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setFlagModal({ isOpen: true, reviewId: review.review_id })}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                            title="Flag for inappropriate content"
                                        >
                                            <FaFlag size={12} />
                                            Flag
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && !error && totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={filteredReviews.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                />
            )}

            <InputModal
                isOpen={flagModal.isOpen}
                onClose={() => setFlagModal({ isOpen: false, reviewId: null })}
                onSubmit={(reason) => handleFlagReview(flagModal.reviewId, reason)}
                title="Flag Review"
                message="Please provide a reason for flagging this review (e.g., inappropriate language, fake review, spam):"
                placeholder="Reason for flagging..."
                confirmText="Flag Review"
                required
                variant="warning"
            />
        </div>
    );
}
