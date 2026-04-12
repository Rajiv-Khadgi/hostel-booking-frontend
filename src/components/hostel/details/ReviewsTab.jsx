import React from 'react';
import { FiStar, FiChevronRight, FiCheckCircle, FiX, FiMessageCircle } from 'react-icons/fi';
import { SectionCard, Stars, STAR_PATH } from './Shared';
import { getImageUrl } from '../../../utils/hostelUtils';

export default function ReviewsTab({ 
    reviews, 
    avgRating, 
    user, 
    myReview,
    reviewForm, 
    setReviewForm, 
    submitting, 
    submitReview, 
    setConfirmDel, 
    imgBase 
}) {
    return (
        <div className="space-y-5">
            {/* Summary */}
            {reviews.length > 0 && (
                <SectionCard className="p-7">
                    <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                        {/* Big number */}
                        <div className="text-center shrink-0">
                            <div className="text-6xl font-black text-gray-900 leading-none mb-2">{avgRating}</div>
                            <Stars n={Math.round(avgRating)} sz="lg" />
                            <div className="mt-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Property Rating</div>
                        </div>

                        {/* Breakdown */}
                        <div className="flex-1 w-full space-y-2 pt-1">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = reviews.filter(r => Math.round(r.rating) === star).length;
                                const pct = (count / reviews.length) * 100;
                                return (
                                    <div key={star} className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 w-8">
                                            <span className="text-xs font-bold text-gray-600">{star}</span>
                                            <FiStar className="w-3 h-3 fill-gray-400 text-gray-400" />
                                        </div>
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="w-8 text-right">
                                            <span className="text-[10px] font-bold text-gray-400">{count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionCard>
            )}

            {/* Form */}
            {user?.role === 'student' && (
                <SectionCard className="p-7">
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <h3 className="text-lg font-bold text-gray-900">{myReview ? 'Edit your review' : 'Share your experience'}</h3>
                        {myReview?.is_verified && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full uppercase tracking-widest">
                                Verified stay
                            </span>
                        )}
                    </div>
                    {myReview && (
                        <p className="text-xs text-gray-500 mb-4">
                            You already reviewed this hostel. Update your rating or comments below.
                        </p>
                    )}
                    <form onSubmit={submitReview} className="space-y-4">
                        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <span className="text-sm font-bold text-gray-600">Rating</span>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <button key={i} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: i })}
                                        className={`transition-all ${i <= reviewForm.rating ? 'scale-110' : 'scale-100 opacity-30 hover:opacity-100'}`}>
                                        <svg className={`w-7 h-7 ${i <= reviewForm.rating ? 'fill-amber-400' : 'fill-gray-400'}`} viewBox="0 0 20 20">
                                            <path d={STAR_PATH} />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea
                            required
                            placeholder="Describe your stay, facilities, and the environment..."
                            className="w-full h-32 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
                            value={reviewForm.comments}
                            onChange={e => setReviewForm({ ...reviewForm, comments: e.target.value })}
                        />
                        <button type="submit" disabled={submitting}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2">
                            {submitting ? 'Saving...' : <>{myReview ? 'Update Review' : 'Post Public Review'} <FiChevronRight className="w-4 h-4" /></>}
                        </button>
                    </form>
                </SectionCard>
            )}

            {/* List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                        <FiMessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium italic">No reviews yet. Be the first to share!</p>
                    </div>
                ) : reviews.map(rev => (
                    <SectionCard key={rev.review_id} className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 font-bold border border-emerald-100 overflow-hidden shrink-0">
                                    {rev.reviewer?.profile_image
                                        ? <img src={getImageUrl(rev.reviewer.profile_image, imgBase)} className="w-full h-full object-cover" alt="" />
                                        : <span>{rev.reviewer?.first_name?.[0]}{rev.reviewer?.last_name?.[0]}</span>}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900">{rev.reviewer?.first_name} {rev.reviewer?.last_name}</h4>
                                        {rev.is_verified && <FiCheckCircle className="text-emerald-500 w-3.5 h-3.5" title="Verified stay" />}
                                        {rev.is_flagged && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-widest">Flagged</span>}
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <Stars n={rev.rating} sz="xs" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{(() => {
                                            const createdAtValue = rev.created_at || rev.createdAt;
                                            const parsed = createdAtValue ? new Date(createdAtValue) : null;
                                            return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString() : 'Recently';
                                        })()}</span>
                                    </div>
                                </div>
                            </div>
                            {user?.id === rev.user_id && (
                                <button onClick={() => setConfirmDel({ isOpen: true, reviewId: rev.review_id })}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                    <FiX className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <p className="mt-4 text-sm text-gray-600 leading-relaxed font-medium">{rev.comments}</p>
                    </SectionCard>
                ))}
            </div>
        </div>
    );
}
