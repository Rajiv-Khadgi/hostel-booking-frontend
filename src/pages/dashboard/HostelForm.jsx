import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import * as Yup from 'yup';
import api from '../../api/axios';
import ImageManager from '../../components/ImageManager';
import { FiInfo, FiMapPin, FiBox, FiImage, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const hostelSchema = Yup.object().shape({
    name: Yup.string().required('Name is required').max(100, 'Max 100 characters'),
    description: Yup.string(),
    city: Yup.string().required('City is required').max(50, 'Max 50 characters'),
    area: Yup.string().max(50, 'Max 50 characters'),
    address: Yup.string().required('Address is required').max(255, 'Max 255 characters'),
    latitude: Yup.number().typeError('Must be a number').nullable().transform((value, originalValue) => String(originalValue).trim() === '' ? null : value),
    longitude: Yup.number().typeError('Must be a number').nullable().transform((value, originalValue) => String(originalValue).trim() === '' ? null : value),
    gender_type: Yup.string().oneOf(['BOYS', 'GIRLS', 'COED'], 'Invalid gender selection').required('Gender is required'),
    amenityIds: Yup.array().of(Yup.number()).min(1, 'Select at least one amenity').required('Amenities are required'),
    serviceIds: Yup.array().of(Yup.number()).min(1, 'Select at least one service').required('Services are required')
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
        longitude: '',
        gender_type: 'COED',
        amenityIds: [],
        serviceIds: []
    });

    const [availableAmenities, setAvailableAmenities] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [coverIndex, setCoverIndex] = useState(0);

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const fileInputRef = useRef(null);
    
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [showAllServices, setShowAllServices] = useState(false);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [amenitiesRes, servicesRes] = await Promise.all([
                    api.get('/metadata/amenities'),
                    api.get('/metadata/services')
                ]);
                setAvailableAmenities(amenitiesRes.data.amenities || []);
                setAvailableServices(servicesRes.data.services || []);
            } catch (err) {
                console.error("Failed to load metadata", err);
            }
            
            if (isEditMode) {
                await fetchHostel();
            } else {
                setInitialLoading(false);
            }
        };
        fetchMetadata();
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
                longitude: h.longitude || '',
                gender_type: h.gender_type || 'COED',
                amenityIds: h.amenities ? h.amenities.map(a => a.amenity_id) : [],
                serviceIds: h.services ? h.services.map(s => s.service_id) : []
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
    
    const handleCheckboxChange = (type, id) => {
        setFormData(prev => {
            const currentArray = prev[type];
            const newArray = currentArray.includes(id) 
                ? currentArray.filter(itemId => itemId !== id)
                : [...currentArray, id];
            
            if (errors[type]) {
                setErrors(errs => ({ ...errs, [type]: '' }));
            }
                
            return { ...prev, [type]: newArray };
        });
    };
    
    const processFiles = (filesList) => {
        const files = Array.from(filesList);
        if (selectedImages.length + files.length > 5) {
            setErrors(prev => ({ ...prev, images: 'You can only upload up to 5 images.' }));
        } else {
            setErrors(prev => ({ ...prev, images: '' }));
            setSelectedImages(prev => [...prev, ...files].slice(0, 5));
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            processFiles(e.target.files);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            processFiles(e.dataTransfer.files);
        }
    };
    
    const handleRemoveImage = (indexToRemove) => {
        setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
        if (indexToRemove === coverIndex) setCoverIndex(0);
        else if (indexToRemove < coverIndex) setCoverIndex(prev => prev - 1);
    };

    const handleSetCover = (index) => {
        setCoverIndex(index);
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
                const res = await api.post('/hostels', payload);
                const newHostelId = res.data.hostel?.hostel_id || res.data.hostel?.id;
                
                if (newHostelId && selectedImages.length > 0) {
                    const imgFormData = new FormData();
                    selectedImages.forEach(file => {
                        imgFormData.append('images', file);
                    });
                    imgFormData.append('coverIndex', coverIndex);
                    
                    try {
                        await api.post(`/hostels/${newHostelId}/images`, imgFormData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                    } catch (imgError) {
                        console.error('Failed to upload initial images', imgError);
                    }
                }
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
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                            <FiInfo className="text-emerald-600 text-xl" />
                            <h3 className="text-lg font-medium text-gray-900">Basic Info</h3>
                        </div>

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
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender Type <span className="text-red-500">*</span></label>
                            <select
                                name="gender_type"
                                value={formData.gender_type}
                                onChange={handleChange}
                                className={`appearance-none block w-full px-4 py-2.5 border ${errors.gender_type ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'} rounded-xl shadow-sm sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                            >
                                <option value="COED">Co-Ed (Everyone)</option>
                                <option value="BOYS">Boys Only</option>
                                <option value="GIRLS">Girls Only</option>
                            </select>
                            {errors.gender_type && <p className="mt-1.5 text-sm text-red-500">{errors.gender_type}</p>}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                            <FiMapPin className="text-emerald-600 text-xl" />
                            <h3 className="text-lg font-medium text-gray-900">Location Details</h3>
                        </div>

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

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 pb-2">
                            <FiBox className="text-emerald-600 text-xl" />
                            <h3 className="text-lg font-medium text-gray-900">Amenities & Services</h3>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Amenities <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {(showAllAmenities ? availableAmenities : availableAmenities.slice(0, 6)).map(amenity => (
                                    <label key={amenity.amenity_id} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${formData.amenityIds.includes(amenity.amenity_id) ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={formData.amenityIds.includes(amenity.amenity_id)}
                                            onChange={() => handleCheckboxChange('amenityIds', amenity.amenity_id)}
                                        />
                                        <div className="flex items-center gap-2">
                                            {amenity.icon && <i className={`${amenity.icon} text-lg`}></i>}
                                            <span className="text-sm font-medium">{amenity.name}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {availableAmenities.length > 6 && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                                    className="mt-3 flex items-center justify-center w-full sm:w-auto text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-4 py-2 transition-colors focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    {showAllAmenities ? (
                                        <><FiChevronUp className="mr-1" /> Show Less</>
                                    ) : (
                                        <><FiChevronDown className="mr-1" /> View all {availableAmenities.length} Amenities</>
                                    )}
                                </button>
                            )}
                            {errors.amenityIds && <p className="mt-1.5 text-sm text-red-500">{errors.amenityIds}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3 mt-4">Services <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {(showAllServices ? availableServices : availableServices.slice(0, 6)).map(service => (
                                    <label key={service.service_id} className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-colors ${formData.serviceIds.includes(service.service_id) ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={formData.serviceIds.includes(service.service_id)}
                                            onChange={() => handleCheckboxChange('serviceIds', service.service_id)}
                                        />
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                {service.icon && <i className={`${service.icon} text-lg ${formData.serviceIds.includes(service.service_id) ? 'text-emerald-600' : 'text-gray-500'}`}></i>}
                                                <span className={`text-sm font-bold ${formData.serviceIds.includes(service.service_id) ? 'text-emerald-700' : 'text-gray-900'}`}>{service.name}</span>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.serviceIds.includes(service.service_id) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                                {formData.serviceIds.includes(service.service_id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                        </div>
                                        {service.description && <p className="text-xs text-gray-500 line-clamp-2">{service.description}</p>}
                                    </label>
                                ))}
                            </div>
                            {availableServices.length > 6 && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllServices(!showAllServices)}
                                    className="mt-3 flex items-center justify-center w-full sm:w-auto text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-4 py-2 transition-colors focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    {showAllServices ? (
                                        <><FiChevronUp className="mr-1" /> Show Less</>
                                    ) : (
                                        <><FiChevronDown className="mr-1" /> View all {availableServices.length} Services</>
                                    )}
                                </button>
                            )}
                            {errors.serviceIds && <p className="mt-1.5 text-sm text-red-500">{errors.serviceIds}</p>}
                        </div>
                    </div>

                    {!isEditMode && (
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 pb-2">
                                <FiImage className="text-emerald-600 text-xl" />
                                <h3 className="text-lg font-medium text-gray-900">Initial Images</h3>
                            </div>
                            <div>
                                {errors.images && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errors.images}</div>}
                                
                                {selectedImages.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                                        {selectedImages.map((file, idx) => (
                                            <div key={idx} className="relative group h-32 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                                <img src={URL.createObjectURL(file)} alt="Preview" className="object-cover w-full h-full" />
                                                {idx === coverIndex && <span className="absolute top-2 left-2 bg-emerald-600/90 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white shadow-sm pointer-events-none z-10">COVER</span>}
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                                                    {idx !== coverIndex && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSetCover(idx)}
                                                            className="bg-emerald-500 text-white px-3 py-1 text-xs rounded-full hover:bg-emerald-600 shadow-md transform scale-90 group-hover:scale-100 transition-all font-medium"
                                                        >
                                                            Set as Cover
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(idx)}
                                                        className="bg-red-500 text-white p-2 text-sm rounded-full hover:bg-red-600 shadow-md transform scale-90 group-hover:scale-100 transition-all"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {selectedImages.length < 5 && (
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-emerald-400 transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-500 mt-1">First photo acts as the cover image. Up to 5 images.</p>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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
