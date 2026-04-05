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
    room_number: Yup.string().required('Room number is required'),
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
        room_type: 'SINGLE',
        total_beds: 1,
        available_beds: 1,
        price: '',
        room_number: '',
        description: ''
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = React.useRef(null);

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
                        room_type: room.room_type || 'SINGLE',
                        total_beds: room.total_beds || 1,
                        available_beds: room.available_beds || 1,
                        price: Number(room.price) || '',
                        room_number: room.room_number || '',
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

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedImage(e.target.files[0]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
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
                const res = await api.post('/rooms', formData);
                const newRoomId = res.data.room?.room_id || res.data.room?.id;
                
                if (newRoomId && selectedImage) {
                    const imgFormData = new FormData();
                    imgFormData.append('images', selectedImage);
                    try {
                        await api.post(`/rooms/${newRoomId}/images`, imgFormData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                    } catch (imgError) {
                        console.error('Failed to upload initial image', imgError);
                    }
                }
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Property <span className="text-red-500">*</span></label>
                                <select
                                    name="hostel_id"
                                    value={formData.hostel_id}
                                    onChange={handleChange}
                                    disabled={isEditMode}
                                    className={`appearance-none block w-full px-4 py-2.5 border ${isEditMode ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-gray-50 focus:bg-white border-gray-200 focus:ring-emerald-500'
                                        } rounded-xl shadow-sm focus:outline-none sm:text-sm transition-colors`}
                                >
                                    <option value="" disabled>Select a hostel</option>
                                    {hostels.map(h => (
                                        <option key={h.hostel_id} value={h.hostel_id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number / Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="room_number"
                                    value={formData.room_number}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-4 py-2.5 border ${errors.room_number ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'} rounded-xl shadow-sm focus:outline-none sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                                    placeholder="E.g., 101, A-1"
                                />
                                {errors.room_number && <p className="mt-1.5 text-sm text-red-500">{errors.room_number}</p>}
                            </div>
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
                                    <option value="SINGLE">Single Room</option>
                                    <option value="DOUBLE">Double Room</option>
                                    <option value="TRIPLE">Triple Room</option>
                                    <option value="DORM">Dormitory</option>
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
                        
                        {!isEditMode && (
                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Room Photo <span className="text-gray-400 font-normal">(Single Image for this Room Type)</span></label>
                                {selectedImage ? (
                                    <div className="relative group h-40 w-full sm:w-64 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                        <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="object-cover w-full h-full" />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="bg-red-500 text-white p-2 text-sm rounded-full hover:bg-red-600 shadow-md transform scale-90 group-hover:scale-100 transition-all"
                                            >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-emerald-400 transition-colors cursor-pointer w-full sm:w-64"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm font-medium text-gray-900">Upload Room Photo</p>
                                        <p className="text-xs text-gray-500 mt-1">Select one distinct image</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
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
                <ImageManager entityType="rooms" entityId={id} maxImages={1} />
            )}
        </div>
    );
}
