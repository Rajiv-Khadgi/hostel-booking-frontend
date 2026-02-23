import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';
import api from '../../api/axios';
import ImageManager from '../../components/ImageManager';

const roomSchema = Yup.object().shape({
    room_type: Yup.string().required('Room Type is required'),
    total_beds: Yup.number().typeError('Must be a number').positive('Must be positive').integer('Must be an integer').required('Total beds is required'),
    available_beds: Yup.number()
        .typeError('Must be a number')
        .min(0, 'Cannot be negative')
        .integer('Must be an integer')
        .required('Available beds is required')
        .test('lessThanTotal', 'Available beds cannot exceed total beds', function (value) {
            return value <= this.parent.total_beds;
        }),
    price: Yup.number().typeError('Must be a number').positive('Must be positive').required('Price is required'),
    description: Yup.string()
});

export default function RoomForm() {
    const { id } = useParams(); // room ID if editing
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const hostelIdFromQuery = searchParams.get('hostelId');

    const [hostels, setHostels] = useState([]);
    const [formData, setFormData] = useState({
        hostel_id: hostelIdFromQuery || '',
        room_type: 'Single',
        total_beds: 1,
        available_beds: 1,
        price: '',
        description: ''
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                // Fetch hostels to populate dropdown
                const hostelsRes = await api.get('/hostels/my-hostels');
                const myHostels = hostelsRes.data.hostels || [];
                setHostels(myHostels);

                if (!isEditMode && myHostels.length > 0 && !hostelIdFromQuery) {
                    setFormData(prev => ({ ...prev, hostel_id: myHostels[0].hostel_id }));
                }

                // If edit mode, fetch room details
                if (isEditMode) {
                    const roomRes = await api.get(`/rooms/${id}`);
                    const room = roomRes.data.room;

                    setFormData({
                        hostel_id: room.hostel_id || '',
                        room_type: room.room_type || 'Single',
                        total_beds: room.total_beds || 1,
                        available_beds: room.available_beds || 1,
                        price: Number(room.price) || '',
                        description: room.description || ''
                    });
                }
            } catch (err) {
                setServerError('Failed to load required data.');
            } finally {
                setInitialLoading(false);
            }
        };

        init();
    }, [id, hostelIdFromQuery, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        if (!formData.hostel_id) {
            setServerError('Please select a property first.');
            return;
        }

        try {
            await roomSchema.validate(formData, { abortEarly: false });
            setIsSubmitting(true);

            if (isEditMode) {
                await api.put(`/rooms/${id}`, formData);
            } else {
                await api.post('/rooms', formData);
            }

            navigate('/dashboard/rooms');
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const validationErrors = {};
                err.inner.forEach((error) => {
                    validationErrors[error.path] = error.message;
                });
                setErrors(validationErrors);
            } else {
                setServerError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} room.`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <Link to="/dashboard/rooms" className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors flex items-center gap-1 mb-4">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Rooms
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {isEditMode ? 'Edit Room Details' : 'Add New Room'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {isEditMode ? 'Update pricing and occupancy for this room.' : 'Create a new room type for your property.'}
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {serverError && (
                    <div className="m-6 mb-0 bg-red-50 border border-red-100 rounded-lg p-4">
                        <p className="text-sm text-red-600 font-medium">{serverError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                    <div className="space-y-4">

                        {/* Hostel Selection (Readonly in edit mode typically, but let's allow it if needed, or disable it) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Property <span className="text-red-500">*</span></label>
                            <select
                                name="hostel_id"
                                value={formData.hostel_id}
                                onChange={handleChange}
                                disabled={isEditMode} // Usually don't move rooms between hostels
                                className={`appearance-none block w-full px-4 py-2.5 border ${isEditMode ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-gray-50 focus:bg-white border-gray-200 focus:ring-emerald-500'
                                    } rounded-xl shadow-sm focus:outline-none sm:text-sm transition-colors`}
                            >
                                <option value="" disabled>Select a hostel</option>
                                {hostels.map(h => (
                                    <option key={h.hostel_id} value={h.hostel_id}>{h.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type <span className="text-red-500">*</span></label>
                                <select
                                    name="room_type"
                                    value={formData.room_type}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-4 py-2.5 border ${errors.room_type ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'} rounded-xl shadow-sm focus:outline-none sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                                >
                                    <option value="Single">Single Room</option>
                                    <option value="Double">Double Room</option>
                                    <option value="Triple">Triple Room</option>
                                    <option value="Dormitory">Dormitory</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Studio">Studio</option>
                                </select>
                                {errors.room_type && <p className="mt-1.5 text-sm text-red-500">{errors.room_type}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent Price (NPR) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">Rs.</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-4 py-2.5 border ${errors.price ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                                        placeholder="E.g., 15000"
                                    />
                                </div>
                                {errors.price && <p className="mt-1.5 text-sm text-red-500">{errors.price}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Beds <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="total_beds"
                                    value={formData.total_beds}
                                    onChange={(e) => {
                                        handleChange(e);
                                        // Automatically sync available beds if total beds is updated and it's a new room
                                        if (!isEditMode) {
                                            setFormData(prev => ({ ...prev, available_beds: e.target.value }));
                                        }
                                    }}
                                    className={`appearance-none block w-full px-4 py-2.5 border ${errors.total_beds ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'} rounded-xl shadow-sm focus:outline-none sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                                    min="1"
                                />
                                {errors.total_beds && <p className="mt-1.5 text-sm text-red-500">{errors.total_beds}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Available Beds (Currently Free) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="available_beds"
                                    value={formData.available_beds}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-4 py-2.5 border ${errors.available_beds ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'} rounded-xl shadow-sm focus:outline-none sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                                    min="0"
                                />
                                {errors.available_beds && <p className="mt-1.5 text-sm text-red-500">{errors.available_beds}</p>}
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea
                                name="description"
                                rows="3"
                                value={formData.description}
                                onChange={handleChange}
                                className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors bg-gray-50 focus:bg-white"
                                placeholder="E.g., Attached bathroom, south facing window..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <Link
                            to="/dashboard/rooms"
                            className="inline-flex justify-center px-5 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex justify-center px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-all hover:shadow-md"
                        >
                            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Room' : 'Add Room')}
                        </button>
                    </div>
                </form>
            </div>

            {isEditMode && (
                <ImageManager entityType="rooms" entityId={id} />
            )}
        </div>
    );
}
