import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';
import { getFriendlyErrorMessage } from '../utils/errorUtils';

// Modular Components
import { GENDER_CFG } from '../components/hostel/details/Shared';
import HostelGallery from '../components/hostel/details/HostelGallery';
import HostelIdentity from '../components/hostel/details/HostelIdentity';
import HostelSidebar from '../components/hostel/details/HostelSidebar';
import MobileActions from '../components/hostel/details/MobileActions';
import OverviewTab from '../components/hostel/details/OverviewTab';
import RoomsTab from '../components/hostel/details/RoomsTab';
import AmenitiesTab from '../components/hostel/details/AmenitiesTab';
import ReviewsTab from '../components/hostel/details/ReviewsTab';
import BookingModal from '../components/hostel/details/BookingModal';
import VisitModal from '../components/hostel/details/VisitModal';

export default function HostelDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const imgBase = api.defaults.baseURL;

    const [hostel, setHostel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');

    const [bookingModal, setBookingModal] = useState({ isOpen: false, roomId: null, group: null, room: null, hostelName: '' });
    const [bookingForm, setBookingForm] = useState({ startDate: new Date().toISOString().split('T')[0], months: 6 });
    const [bookingLoading, setBookingLoading] = useState(false);

    const [visitModal, setVisitModal] = useState({ isOpen: false });
    const [visitDate, setVisitDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    const [visitLoading, setVisitLoading] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [myReview, setMyReview] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comments: '' });
    const [submitting, setSubmitting] = useState(false);
    const [confirmDel, setConfirmDel] = useState({ isOpen: false, reviewId: null });
    const [gallery, setGallery] = useState({ isOpen: false, index: 0 });

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get(`/hostels/${id}`);
                setHostel(res.data.hostel);
                loadReviews();
                if (localStorage.getItem('accessToken')) {
                    const s = await api.get('/hostels/saved');
                    setIsSaved(s.data.hostels.map(h => h.hostel_id).includes(Number(id)));
                }
            } catch (e) { setError(e.response?.data?.error || 'Failed to load hostel details'); }
            finally { setLoading(false); }
        })();
    }, [id]);

    const loadReviews = async () => {
        try { const r = await api.get(`/hostels/${id}/reviews`); setReviews(r.data.reviews || []); }
        catch { /* non-critical */ }
    };

    const loadMyReview = async () => {
        if (!user || user.role !== 'student') {
            setMyReview(null);
            return;
        }

        try {
            const response = await api.get(`/reviews/hostel/${id}/me`);
            setMyReview(response.data.review || null);
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('Failed to load my review', error);
            }
            setMyReview(null);
        }
    };

    useEffect(() => {
        if (!hostel) return;
        loadMyReview();
    }, [hostel, user?.id, user?.role]);

    useEffect(() => {
        if (myReview) {
            setReviewForm({ rating: myReview.rating, comments: myReview.comments || '' });
        } else {
            setReviewForm({ rating: 5, comments: '' });
        }
    }, [myReview]);

    const avgRating = useMemo(() =>
        reviews.length ? +(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null,
        [reviews]);

    const minPrice = useMemo(() =>
        hostel?.rooms?.length ? Math.min(...hostel.rooms.map(r => Number(r.price))) : null,
        [hostel?.rooms]);

    const grouped = useMemo(() => {
        if (!hostel?.rooms) return [];
        const m = {};
        for (const r of hostel.rooms) {
            const k = `${r.room_type}_${r.price}`;
            if (!m[k]) m[k] = { room_type: r.room_type, price: r.price, description: r.description, rooms: [], avail: 0, total: 0 };
            m[k].rooms.push(r); m[k].avail += r.available_beds; m[k].total += r.total_beds;
            if (!m[k].description && r.description) m[k].description = r.description;
        }
        return Object.values(m);
    }, [hostel?.rooms]);

    const toggleSave = async () => {
        if (!localStorage.getItem('accessToken')) { navigate('/login', { state: { from: `/hostels/${id}` } }); return; }
        try {
            if (isSaved) { await api.delete(`/hostels/${id}/save`); setIsSaved(false); toast.success('Removed from wishlist'); }
            else { await api.post(`/hostels/${id}/save`); setIsSaved(true); toast.success('Saved to wishlist!'); }
        } catch (e) { toast.error(getFriendlyErrorMessage(e, 'Failed to update wishlist')); }
    };

    const openBooking = (group) => {
        if (!user) { navigate('/login', { state: { from: `/hostels/${id}` } }); return; }
        if (user.role !== 'student') { toast.error('Only students can request bookings.'); return; }
        const room = group.rooms.find(r => r.available_beds > 0) || group.rooms[0];
        setBookingModal({
            isOpen: true,
            roomId: room.room_id,
            group,
            room,
            hostelName: hostel?.name || ''
        });
    };

    const submitBooking = async (e) => {
        e.preventDefault();
        try {
            setBookingLoading(true);
            await api.post('/bookings', { room_id: bookingModal.roomId, start_date: bookingForm.startDate, months: +bookingForm.months });
            toast.success('Booking requested! The owner will review your request.');
            setBookingModal({ isOpen: false, roomId: null, group: null, room: null, hostelName: '' });
        } catch (e) { toast.error(getFriendlyErrorMessage(e, 'Failed to request booking.')); }
        finally { setBookingLoading(false); }
    };

    const submitVisit = async (e) => {
        if (e) e.preventDefault();
        if (visitLoading) return;
        setVisitLoading(true);
        try {
            await api.post('/visits', { hostel_id: id, visit_date: visitDate });
            toast.success('Visit scheduled! Track it in your dashboard.');
            setVisitModal({ isOpen: false });
        } catch (error) { toast.error(getFriendlyErrorMessage(error, 'Failed to schedule visit.')); }
        finally { setVisitLoading(false); }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            if (myReview) {
                await api.put(`/reviews/${myReview.review_id}`, reviewForm);
                toast.success('Review updated!');
            } else {
                await api.post(`/hostels/${id}/reviews`, reviewForm);
                toast.success('Review posted!');
            }
            await Promise.all([loadReviews(), loadMyReview()]);
        } catch (e) { toast.error(getFriendlyErrorMessage(e, 'Failed to post review.')); }
        finally { setSubmitting(false); }
    };

    const deleteReview = async (rid) => {
        try { await api.delete(`/reviews/${rid}`); loadReviews(); toast.success('Review deleted.'); }
        catch { toast.error('Failed to delete review'); }
        finally { setConfirmDel({ isOpen: false, reviewId: null }); }
    };

    const startChat = async () => {
        if (!user) { navigate('/login', { state: { from: `/hostels/${id}` } }); return; }
        try { await api.post('/chat/conversations', { targetUserId: hostel.user_id }); navigate('/dashboard/chat'); }
        catch { toast.error('Failed to start chat'); }
    };

    const nextImage = () => setGallery(g => ({ ...g, index: (g.index + 1) % hostel.images.length }));
    const prevImage = () => setGallery(g => ({ ...g, index: g.index === 0 ? hostel.images.length - 1 : g.index - 1 }));

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5">
            <div className="w-14 h-14 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
            <p className="text-sm font-semibold text-gray-400 animate-pulse tracking-wide">Loading property…</p>
        </div>
    );

    if (error || !hostel) return (
        <div className="max-w-md mx-auto px-6 py-24 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Property Unavailable</h2>
            <p className="text-gray-500 text-sm mb-8">{error || 'Hostel not found'}</p>
            <button onClick={() => navigate('/explore')} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200">Back to Explore</button>
        </div>
    );

    const gender = GENDER_CFG[hostel.gender_type] || GENDER_CFG.COED;
    const ownerName = hostel.owner ? [hostel.owner.first_name, hostel.owner.middle_name, hostel.owner.last_name].filter(Boolean).join(' ') : 'Owner';
    const ownerInitials = hostel.owner ? `${hostel.owner.first_name?.[0] ?? ''}${hostel.owner.last_name?.[0] ?? ''}` : '?';

    return (
        <div className="pb-24 lg:pb-12 bg-white/50 min-h-screen">
            <HostelGallery hostel={hostel} imgBase={imgBase} gallery={gallery} setGallery={setGallery} nextImage={nextImage} prevImage={prevImage} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-7">
                <div className="flex flex-col lg:flex-row gap-7 items-stretch relative">
                    <div className="flex-1 min-w-0">
                        <HostelIdentity hostel={hostel} avgRating={avgRating} reviewsCount={reviews.length} activeTab={activeTab} setActiveTab={setActiveTab} gender={gender} />

                        {activeTab === 'Overview' && <OverviewTab hostel={hostel} reviews={reviews} avgRating={avgRating} setActiveTab={setActiveTab} hasMap={hostel.latitude && hostel.longitude} imgBase={imgBase} />}
                        {activeTab === 'Rooms & Pricing' && <RoomsTab grouped={grouped} openBooking={openBooking} />}
                        {activeTab === 'Amenities' && <AmenitiesTab hostel={hostel} />}
                        {activeTab === 'Reviews' && <ReviewsTab reviews={reviews} avgRating={avgRating} user={user} myReview={myReview} reviewForm={reviewForm} setReviewForm={setReviewForm} submitting={submitting} submitReview={submitReview} setConfirmDel={setConfirmDel} imgBase={imgBase} />}
                    </div>

                    <HostelSidebar minPrice={minPrice} setActiveTab={setActiveTab} user={user} navigate={navigate} id={id} setVisitModal={setVisitModal} hostel={hostel} ownerInitials={ownerInitials} ownerName={ownerName} imgBase={imgBase} toggleSave={toggleSave} isSaved={isSaved} startChat={startChat} />
                </div>
            </div>

            <MobileActions user={user} id={id} navigate={navigate} setVisitModal={setVisitModal} setActiveTab={setActiveTab} />
            
            <BookingModal modal={bookingModal} setModal={setBookingModal} form={bookingForm} setForm={setBookingForm} loading={bookingLoading} onSubmit={submitBooking} />
            <VisitModal isOpen={visitModal.isOpen} onClose={() => setVisitModal({ isOpen: false })} date={visitDate} setDate={setVisitDate} loading={visitLoading} onSubmit={submitVisit} />
            
            <ConfirmModal 
                isOpen={confirmDel.isOpen} 
                onClose={() => setConfirmDel({ isOpen: false, reviewId: null })} 
                onConfirm={() => deleteReview(confirmDel.reviewId)} 
                title="Delete Review" 
                message="Are you sure you want to delete your review?" 
                confirmText="Delete" 
                variant="danger" 
            />
        </div>
    );
}
