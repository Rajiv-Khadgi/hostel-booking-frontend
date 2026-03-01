import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

export default function HostelDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [hostel, setHostel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const roomTypeLabels = {
        'SINGLE': 'Single',
        'DOUBLE': 'Double',
        'TRIPLE': 'Triple',
        'DORM': 'Dormitory'
    };

    const [bookingModal, setBookingModal] = useState({ isOpen: false, roomId: null });
    const [bookingForm, setBookingForm] = useState({ startDate: new Date().toISOString().split('T')[0], months: 6 });
    const [visitModal, setVisitModal] = useState({ isOpen: false });
    const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
    const [visitLoading, setVisitLoading] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comments: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchHostelDetails = async () => {
            try {
                const response = await api.get(`/hostels/${id}`);
                setHostel(response.data.hostel);

                // Fetch reviews separately to ensure they are up to date
                fetchReviews();

                // Check if already saved if user is logged in
                if (localStorage.getItem('accessToken')) {
                    const savedResponse = await api.get('/hostels/saved');
                    const savedIds = savedResponse.data.hostels.map(h => h.hostel_id);
                    setIsSaved(savedIds.includes(Number(id)));
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load hostel details');
            } finally {
                setLoading(false);
            }
        };

        fetchHostelDetails();
    }, [id]);

    const fetchReviews = async () => {
        try {
            const response = await api.get(`/hostels/${id}/reviews`);
            setReviews(response.data.reviews || []);
        } catch (err) {
            console.error('Failed to fetch reviews', err);
        }
    };

    const handleToggleSave = async () => {
        if (!localStorage.getItem('accessToken')) {
            navigate('/login', { state: { from: `/hostels/${id}` } });
            return;
        }

        try {
            if (isSaved) {
                await api.delete(`/hostels/${id}/save`);
                setIsSaved(false);
            } else {
                await api.post(`/hostels/${id}/save`);
                setIsSaved(true);
            }
        } catch (err) {
            console.error('Failed to toggle save', err);
        }
    };

    const handleRequestBooking = (roomId) => {
        if (!user) {
            navigate('/login', { state: { from: `/hostels/${id}` } });
            return;
        }

        if (user.role !== 'student') {
            alert('Only students can request bookings.');
            return;
        }

        setBookingModal({ isOpen: true, roomId });
    };

    const submitBooking = async (e) => {
        e.preventDefault();
        try {
            setBookingLoading(true);

            await api.post('/bookings', {
                room_id: bookingModal.roomId,
                start_date: bookingForm.startDate,
                months: Number(bookingForm.months)
            });

            alert('Booking requested successfully! The owner will review your request.');
            setBookingModal({ isOpen: false, roomId: null });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to request booking.');
        } finally {
            setBookingLoading(false);
        }
    };

    const submitVisit = async (e) => {
        e.preventDefault();
        try {
            setVisitLoading(true);
            await api.post('/visits', {
                hostel_id: id,
                visit_date: visitDate
            });
            alert('Visit scheduled successfully! You can track it in your dashboard.');
            setVisitModal({ isOpen: false });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to schedule visit.');
        } finally {
            setVisitLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmittingReview(true);
            await api.post(`/hostels/${id}/reviews`, reviewForm);
            setReviewForm({ rating: 5, comments: '' });
            fetchReviews();
            alert('Review submitted successfully!');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit review. Make sure you have a verified stay.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete your review?')) return;
        try {
            await api.delete(`/reviews/${reviewId}`);
            fetchReviews();
        } catch (err) {
            alert('Failed to delete review');
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (error || !hostel) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-8 mb-6 inline-block shadow-sm">
                    <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Property</h2>
                    <p className="text-red-600">{error || 'Hostel not found'}</p>
                </div>
                <div>
                    <Link to="/explore" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Explore
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-16">

            {/* Title & Header Section */}
            <div className="bg-white border-b border-gray-200 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <Link to="/explore" className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors flex items-center gap-1 mb-4">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Search
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                                {hostel.name}
                            </h1>
                            <p className="text-lg text-gray-500 flex items-center gap-2">
                                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {hostel.address}, {hostel.city} {hostel.area && `(${hostel.area})`}
                            </p>
                        </div>

                        {hostel.owner && (
                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/login', { state: { from: `/hostels/${id}` } });
                                            return;
                                        }
                                        setVisitModal({ isOpen: true });
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Schedule a Visit
                                </button>
                                <button
                                    onClick={handleToggleSave}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all border ${isSaved
                                        ? 'bg-red-50 text-red-600 border-red-100'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <svg className={`w-5 h-5 ${isSaved ? 'fill-red-500' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {isSaved ? 'Saved to Wishlist' : 'Save Property'}
                                </button>
                                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                    <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                                        {hostel.owner.first_name?.[0]}{hostel.owner.last_name?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Managed by</p>
                                        <p className="text-sm font-bold text-gray-900">{hostel.owner.first_name} {hostel.owner.last_name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Images Grid */}
                <div className="mb-10 h-64 sm:h-96 md:h-[30rem] bg-gray-200 rounded-3xl overflow-hidden relative shadow-sm border border-gray-100">
                    {hostel.images && hostel.images.length > 0 ? (
                        <img src={api.defaults.baseURL.replace('/api', '') + hostel.images[0].image_url} alt={hostel.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                            <svg className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>No images available</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content (About & Amenities) */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About this property</h2>
                            <div className="prose prose-emerald max-w-none text-gray-600 leading-relaxed">
                                {hostel.description ? (
                                    <p className="whitespace-pre-line">{hostel.description}</p>
                                ) : (
                                    <p className="italic text-gray-400">No description provided by the owner.</p>
                                )}
                            </div>
                        </section>

                        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Amenities</h2>
                            {hostel.amenities && hostel.amenities.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {hostel.amenities.map(amenity => (
                                        <div key={amenity.amenity_id} className="flex items-center gap-3 text-gray-700">
                                            <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="font-medium">{amenity.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No amenities listed.</p>
                            )}
                        </section>

                        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Guest Reviews</h2>
                                <div className="flex items-center gap-2">
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className={`w-5 h-5 ${i < Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="font-bold text-gray-900">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'No ratings'}</span>
                                    <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
                                </div>
                            </div>

                            {/* Inline Review Form */}
                            {user?.role === 'student' && !reviews.some(r => r.user_id === user.id) && (
                                <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4">Leave a Review</h3>
                                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                    className={`p-1 transition-transform active:scale-90 ${star <= reviewForm.rating ? 'text-amber-400' : 'text-gray-300'}`}
                                                >
                                                    <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            placeholder="Share your experience staying here..."
                                            required
                                            value={reviewForm.comments}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow min-h-[100px]"
                                        />
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                        >
                                            {submittingReview ? 'Submitting...' : 'Post Review'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {reviews.length > 0 ? (
                                <div className="space-y-8">
                                    {reviews.map((review) => (
                                        <div key={review.review_id} className="border-b border-gray-50 pb-8 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
                                                        {review.reviewer?.profile_image ? (
                                                            <img
                                                                src={api.defaults.baseURL.replace('/api', '') + '/' + review.reviewer.profile_image}
                                                                className="w-full h-full object-cover"
                                                                alt={review.reviewer.first_name}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-emerald-50 text-emerald-700 font-bold">
                                                                {review.reviewer?.first_name?.[0]}{review.reviewer?.last_name?.[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{review.reviewer?.first_name} {review.reviewer?.last_name}</p>
                                                        <div className="flex text-amber-400 scale-75 origin-left">
                                                            {[...Array(5)].map((_, i) => (
                                                                <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs text-gray-400">
                                                        {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recently'}
                                                    </span>
                                                    {user?.id === review.user_id && (
                                                        <button
                                                            onClick={() => handleDeleteReview(review.review_id)}
                                                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed mb-4">{review.comments}</p>

                                            {review.reply && (
                                                <div className="ml-8 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="h-6 w-6 bg-emerald-200 rounded-full flex items-center justify-center text-[10px] text-emerald-800 font-bold">
                                                            {hostel.owner?.first_name?.[0]}{hostel.owner?.last_name?.[0]}
                                                        </div>
                                                        <p className="text-sm font-bold text-emerald-900">Owner's Response</p>
                                                        <span className="text-[10px] text-emerald-600/60 ml-auto">
                                                            {review.reply_date ? new Date(review.reply_date).toLocaleDateString() : ''}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-emerald-800 leading-relaxed">{review.reply}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 px-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No reviews yet.</p>
                                    <p className="text-sm text-gray-400 mt-1">Be the first to share your experience!</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar (Rooms Listing & Booking Action) */}
                    <div className="lg:col-span-1 border-gray-200">
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden sticky top-24">
                            <div className="bg-emerald-700 p-6 text-white text-center">
                                <h3 className="text-xl font-bold tracking-tight">Available Rooms</h3>
                                <p className="text-emerald-100 text-sm mt-1">Select a room to request a booking.</p>
                            </div>

                            <div className="p-0">
                                {hostel.rooms && hostel.rooms.length > 0 ? (
                                    <ul className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto no-scrollbar">
                                        {hostel.rooms.map(room => (
                                            <li key={room.room_id} className="p-5 hover:bg-gray-50 transition-colors">
                                                <div className="flex gap-4 items-start mb-3">
                                                    {/* Room Image Thumbnail */}
                                                    <div className="w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                        {room.images && room.images.length > 0 ? (
                                                            <img
                                                                src={api.defaults.baseURL.replace('/api', '') + room.images[0].image_url}
                                                                alt={`${room.room_type} Room`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Room Details */}
                                                    <div className="flex-1 flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{roomTypeLabels[room.room_type] || room.room_type} Room</h4>
                                                            <p className="text-sm text-gray-500">
                                                                {room.available_beds} beds left
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-emerald-600">Rs. {Number(room.price).toLocaleString()}</p>
                                                            <p className="text-xs text-gray-400">/ month</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {room.description && (
                                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{room.description}</p>
                                                )}

                                                <button
                                                    onClick={() => handleRequestBooking(room.room_id)}
                                                    disabled={bookingLoading || room.status === 'FULL'}
                                                    className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${room.status === 'FULL'
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                        }`}
                                                >
                                                    {room.status === 'FULL' ? 'No Vacancy' : (bookingLoading ? 'Requesting...' : 'Request Booking')}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-8 text-center">
                                        <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        <p className="text-gray-500 font-medium">No rooms added yet.</p>
                                        <p className="text-sm text-gray-400 mt-1">Check back later for availability.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Booking Modal */}
            {bookingModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Request Booking</h3>
                            <button onClick={() => setBookingModal({ isOpen: false, roomId: null })} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={submitBooking} className="p-6">
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingForm.startDate}
                                        onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months)</label>
                                    <select
                                        required
                                        value={bookingForm.months}
                                        onChange={(e) => setBookingForm({ ...bookingForm, months: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                                    >
                                        <option value={1}>1 Month</option>
                                        <option value={3}>3 Months</option>
                                        <option value={6}>6 Months</option>
                                        <option value={12}>12 Months</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setBookingModal({ isOpen: false, roomId: null })}
                                    className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={bookingLoading}
                                    className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700  shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center"
                                >
                                    {bookingLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        'Submit Request'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Visit Modal */}
            {visitModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Schedule a Visit</h3>
                            <button onClick={() => setVisitModal({ isOpen: false })} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={submitVisit} className="p-6">
                            <div className="space-y-4 mb-6">
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-emerald-800 text-sm">
                                    <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>Select a date you'd like to visit the property. The owner will notify you if it's confirmed.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Min tomorrow
                                        value={visitDate}
                                        onChange={(e) => setVisitDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setVisitModal({ isOpen: false })}
                                    className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={visitLoading}
                                    className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center"
                                >
                                    {visitLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        'Schedule Visit'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
