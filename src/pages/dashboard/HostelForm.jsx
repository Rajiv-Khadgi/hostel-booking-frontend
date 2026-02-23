import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import * as Yup from 'yup';
import api from '../../api/axios';
import ImageManager from '../../components/ImageManager';

const hostelSchema = Yup.object().shape({
    name: Yup.string().required('Name is required').max(100, 'Max 100 characters'),
    description: Yup.string(),
    city: Yup.string().required('City is required').max(50, 'Max 50 characters'),
    area: Yup.string().max(50, 'Max 50 characters'),
    address: Yup.string().required('Address is required').max(255, 'Max 255 characters'),
    latitude: Yup.number().typeError('Must be a number').nullable().transform((value, originalValue) => String(originalValue).trim() === '' ? null : value),
    longitude: Yup.number().typeError('Must be a number').nullable().transform((value, originalValue) => String(originalValue).trim() === '' ? null : value)
});

export default function HostelForm() {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        city: '',
        area: '',
        address: '',
        latitude: '',
        longitude: ''
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);

    useEffect(() => {
        if (isEditMode) {
            fetchHostel();
        }
    }, [id]);

    const fetchHostel = async () => {
        try {
            const response = await api.get(`/hostels/${id}`);
            const h = response.data.hostel;
            setFormData({
                name: h.name || '',
                description: h.description || '',
                city: h.city || '',
                area: h.area || '',
                address: h.address || '',
                latitude: h.latitude || '',
                longitude: h.longitude || ''
            });
        } catch (err) {
            setServerError(err.response?.data?.error || 'Failed to fetch hostel details');
        } finally {
            setInitialLoading(false);
        }
    };

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

        try {
            await hostelSchema.validate(formData, { abortEarly: false });
            setIsSubmitting(true);

            const payload = { ...formData };
            if (!payload.latitude) delete payload.latitude;
            if (!payload.longitude) delete payload.longitude;

            if (isEditMode) {
                await api.put(`/hostels/${id}`, payload);
            } else {
                await api.post('/hostels', payload);
            }

            navigate('/dashboard/hostels');
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const validationErrors = {};
                err.inner.forEach((error) => {
                    validationErrors[error.path] = error.message;
                });
                setErrors(validationErrors);
            } else {
                setServerError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} hostel.`);
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
                <Link to="/dashboard/hostels" className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors flex items-center gap-1 mb-4">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Hostels
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {isEditMode ? 'Edit Hostel' : 'Add New Hostel'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {isEditMode ? 'Update your property details.' : 'Provide details about your new property listing.'}
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
                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Basic Info</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`appearance-none block w-full px-4 py-2.5 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                                placeholder="E.g., Sunrise Student Residency"
                            />
                            {errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors bg-gray-50 focus:bg-white"
                                placeholder="Describe your hostel, rules, environment..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Location Details</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-4 py-2.5 border ${errors.city ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'} rounded-xl shadow-sm sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                                    placeholder="City"
                                />
                                {errors.city && <p className="mt-1.5 text-sm text-red-500">{errors.city}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Area / Neighborhood</label>
                                <input
                                    type="text"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-4 py-2.5 border ${errors.area ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'} rounded-xl shadow-sm sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                                    placeholder="E.g., North Campus"
                                />
                                {errors.area && <p className="mt-1.5 text-sm text-red-500">{errors.area}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Address <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className={`appearance-none block w-full px-4 py-2.5 border ${errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'} rounded-xl shadow-sm sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                                placeholder="Full street address"
                            />
                            {errors.address && <p className="mt-1.5 text-sm text-red-500">{errors.address}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude (Optional)</label>
                                <input
                                    type="text"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-4 py-2.5 border ${errors.latitude ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'} rounded-xl shadow-sm sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                                    placeholder="E.g., 27.7172"
                                />
                                {errors.latitude && <p className="mt-1.5 text-sm text-red-500">{errors.latitude}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude (Optional)</label>
                                <input
                                    type="text"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-4 py-2.5 border ${errors.longitude ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'} rounded-xl shadow-sm sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                                    placeholder="E.g., 85.3240"
                                />
                                {errors.longitude && <p className="mt-1.5 text-sm text-red-500">{errors.longitude}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <Link
                            to="/dashboard/hostels"
                            className="inline-flex justify-center px-5 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex justify-center px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-all hover:shadow-md"
                        >
                            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create Hostel')}
                        </button>
                    </div>
                </form>
            </div>

            {isEditMode && (
                <ImageManager entityType="hostels" entityId={id} />
            )}
        </div>
    );
}
