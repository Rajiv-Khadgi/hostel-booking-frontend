import { useState, useEffect, useRef } from 'react';
import * as Yup from 'yup';
import api from '../api/axios';
import ImageManager from './ImageManager';
import {
    FiHome, FiInfo, FiMapPin, FiCheckSquare, FiZap, FiCamera,
    FiChevronDown, FiChevronUp, FiX, FiCheck, FiAlertCircle,
    FiUser, FiUsers, FiNavigation, FiUpload, FiEdit2
} from 'react-icons/fi';

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

const GENDER_OPTIONS = [
    { value: 'COED', label: 'Co-Ed', sublabel: 'Everyone welcome', Icon: FiUsers },
    { value: 'BOYS', label: 'Boys', sublabel: 'Boys only', Icon: FiUser },
    { value: 'GIRLS', label: 'Girls', sublabel: 'Girls only', Icon: FiUser },
];

function SectionHeader({ Icon, label }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">{label}</span>
            <div className="flex-1 h-px bg-gray-100" />
        </div>
    );
}

function FieldError({ message }) {
    if (!message) return null;
    return (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <FiAlertCircle size={11} className="shrink-0" />
            {message}
        </p>
    );
}

function InputField({ label, required, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}{required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {children}
            <FieldError message={error} />
        </div>
    );
}

const inputClass = (error) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
        error
            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
            : 'border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-400'
    }`;

export default function HostelFormDialog({ isOpen, onClose, onSuccess, hostelId, hostelData }) {
    const isEditMode = !!hostelId;

    const [formData, setFormData] = useState({
        name: '', description: '', city: '', area: '',
        address: '', latitude: '', longitude: '',
        gender_type: 'COED', amenityIds: [], serviceIds: []
    });

    const [availableAmenities, setAvailableAmenities] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [metaLoading, setMetaLoading] = useState(false);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [showAllServices, setShowAllServices] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Pre-populate all fields instantly from hostelData (list endpoint now includes amenities/services)
    useEffect(() => {
        if (!isOpen || !hostelData) return;
        setFormData({
            name: hostelData.name || '',
            description: hostelData.description || '',
            city: hostelData.city || '',
            area: hostelData.area || '',
            address: hostelData.address || '',
            latitude: hostelData.latitude || '',
            longitude: hostelData.longitude || '',
            gender_type: hostelData.gender_type || 'COED',
            amenityIds: hostelData.amenities ? hostelData.amenities.map(a => a.amenity_id) : [],
            serviceIds: hostelData.services ? hostelData.services.map(s => s.service_id) : []
        });
    }, [isOpen, hostelData]);

    // Fetch metadata only (hostel detail no longer needed — all data comes via hostelData)
    useEffect(() => {
        if (!isOpen) return;
        const fetchMeta = async () => {
            setMetaLoading(true);
            try {
                const requests = [
                    api.get('/metadata/amenities'),
                    api.get('/metadata/services'),
                    ...(isEditMode && !hostelData ? [api.get(`/hostels/${hostelId}`)] : [])
                ];
                const results = await Promise.all(requests);
                setAvailableAmenities(results[0].data.amenities || []);
                setAvailableServices(results[1].data.services || []);
                // Fallback: populate from detail endpoint if hostelData wasn't passed
                if (isEditMode && !hostelData && results[2]) {
                    const h = results[2].data.hostel;
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
                }
            } catch (err) {
                console.error('Failed to load data', err);
                setServerError('Failed to load required data.');
            } finally {
                setMetaLoading(false);
            }
        };
        fetchMeta();
    }, [isOpen, hostelId, hostelData]);

    // Reset form when closed
    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', description: '', city: '', area: '', address: '', latitude: '', longitude: '', gender_type: 'COED', amenityIds: [], serviceIds: [] });
            setSelectedImages([]);
            setErrors({});
            setServerError('');
            setShowAllAmenities(false);
            setShowAllServices(false);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const setGender = (value) => {
        setFormData(prev => ({ ...prev, gender_type: value }));
        if (errors.gender_type) setErrors(prev => ({ ...prev, gender_type: '' }));
    };

    const toggleItem = (type, id) => {
        setFormData(prev => {
            const arr = prev[type];
            const next = arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];
            if (errors[type]) setErrors(e => ({ ...e, [type]: '' }));
            return { ...prev, [type]: next };
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

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
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
                await api.put(`/hostels/${hostelId}`, payload);
            } else {
                const res = await api.post('/hostels', payload);
                const newHostelId = res.data.hostel?.hostel_id || res.data.hostel?.id;
                if (newHostelId && selectedImages.length > 0) {
                    const imgFormData = new FormData();
                    selectedImages.forEach(file => imgFormData.append('images', file));
                    try {
                        await api.post(`/hostels/${newHostelId}/images`, imgFormData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                    } catch (imgErr) {
                        console.error('Failed to upload images', imgErr);
                    }
                }
            }
            onSuccess?.();
            onClose();
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const ve = {};
                err.inner.forEach(e => { ve[e.path] = e.message; });
                setErrors(ve);
            } else {
                setServerError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} hostel.`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const visibleAmenities = showAllAmenities ? availableAmenities : availableAmenities.slice(0, 9);
    const visibleServices = showAllServices ? availableServices : availableServices.slice(0, 6);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden"
                style={{ maxHeight: '92vh' }}>

                {/* Gradient top bar */}
                <div className="h-1 bg-linear-to-r from-emerald-400 via-emerald-500 to-teal-500 shrink-0" />

                {/* Header */}
                <div className="shrink-0 px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                    <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                        {isEditMode
                            ? <FiEdit2 size={20} className="text-emerald-600" />
                            : <FiHome size={20} className="text-emerald-600" />
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">
                            {isEditMode ? 'Edit Hostel' : 'Add New Hostel'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {isEditMode ? 'Update your property details' : 'Fill in the details to list your property'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">
                        {serverError && (
                            <div className="mx-6 mt-5 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
                                <FiAlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600 font-medium">{serverError}</p>
                            </div>
                        )}

                        <form id="hostel-form" onSubmit={handleSubmit} className="px-6 py-6 space-y-8">

                            {/* ── Basic Info ── */}
                            <section>
                                <SectionHeader Icon={FiInfo} label="Basic Info" />
                                <div className="space-y-4">
                                    <InputField label="Hostel Name" required error={errors.name}>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={inputClass(errors.name)}
                                            placeholder="E.g., Sunrise Student Residency"
                                        />
                                    </InputField>

                                    <InputField label="Description" error={errors.description}>
                                        <textarea
                                            name="description"
                                            rows="3"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className={inputClass(false) + ' resize-none'}
                                            placeholder="Describe your hostel — rules, environment, nearby landmarks…"
                                        />
                                    </InputField>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Gender Type<span className="text-red-400 ml-0.5">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {GENDER_OPTIONS.map(({ value, label, sublabel, Icon }) => {
                                                const active = formData.gender_type === value;
                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => setGender(value)}
                                                        className={`flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl border-2 transition-all ${
                                                            active
                                                                ? 'border-emerald-500 bg-emerald-50'
                                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <Icon size={20} className={active ? 'text-emerald-600' : 'text-gray-400'} />
                                                        <span className={`text-sm font-semibold leading-none ${active ? 'text-emerald-700' : 'text-gray-600'}`}>{label}</span>
                                                        <span className={`text-[10px] leading-none ${active ? 'text-emerald-400' : 'text-gray-400'}`}>{sublabel}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <FieldError message={errors.gender_type} />
                                    </div>
                                </div>
                            </section>

                            {/* ── Location ── */}
                            <section>
                                <SectionHeader Icon={FiMapPin} label="Location" />
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputField label="City" required error={errors.city}>
                                            <input type="text" name="city" value={formData.city} onChange={handleChange}
                                                className={inputClass(errors.city)} placeholder="E.g., Kathmandu" />
                                        </InputField>
                                        <InputField label="Area / Neighborhood" error={errors.area}>
                                            <input type="text" name="area" value={formData.area} onChange={handleChange}
                                                className={inputClass(errors.area)} placeholder="E.g., Baneshwor" />
                                        </InputField>
                                    </div>

                                    <InputField label="Detailed Address" required error={errors.address}>
                                        <input type="text" name="address" value={formData.address} onChange={handleChange}
                                            className={inputClass(errors.address)} placeholder="Full street address" />
                                    </InputField>

                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiNavigation size={13} className="text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">Coordinates <span className="text-gray-400 font-normal">(optional)</span></span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <input type="text" name="latitude" value={formData.latitude} onChange={handleChange}
                                                    className={inputClass(errors.latitude)} placeholder="Latitude  27.7172" />
                                                <FieldError message={errors.latitude} />
                                            </div>
                                            <div>
                                                <input type="text" name="longitude" value={formData.longitude} onChange={handleChange}
                                                    className={inputClass(errors.longitude)} placeholder="Longitude  85.3240" />
                                                <FieldError message={errors.longitude} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ── Amenities ── */}
                            <section>
                                <SectionHeader Icon={FiCheckSquare} label="Amenities" />
                                <p className="text-xs text-gray-400 mb-3 -mt-2">Select all that apply to your property</p>
                                {metaLoading ? (
                                    <div className="flex flex-wrap gap-2">
                                        {[1,2,3,4,5,6,7,8,9].map(i => (
                                            <div key={i} className="h-8 w-20 rounded-full bg-gray-100 animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                    <div className="flex flex-wrap gap-2">
                                        {visibleAmenities.map(amenity => {
                                            const selected = formData.amenityIds.includes(amenity.amenity_id);
                                            return (
                                                <button
                                                    key={amenity.amenity_id}
                                                    type="button"
                                                    onClick={() => toggleItem('amenityIds', amenity.amenity_id)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                                                        selected
                                                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-100'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'
                                                    }`}
                                                >
                                                    {selected && <FiCheck size={11} />}
                                                    {amenity.icon && <i className={`${amenity.icon} text-xs`} />}
                                                    <span>{amenity.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {availableAmenities.length > 9 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAllAmenities(!showAllAmenities)}
                                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                                        >
                                            {showAllAmenities
                                                ? <><FiChevronUp size={13} /> Show fewer</>
                                                : <><FiChevronDown size={13} /> Show all {availableAmenities.length} amenities</>
                                            }
                                        </button>
                                    )}
                                    </>
                                )}
                                <FieldError message={errors.amenityIds} />
                            </section>

                            {/* ── Services ── */}
                            <section>
                                <SectionHeader Icon={FiZap} label="Services" />
                                <p className="text-xs text-gray-400 mb-3 -mt-2">Select services available at your property</p>
                                {metaLoading ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                        {[1,2,3,4,5,6].map(i => (
                                            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                        {visibleServices.map(service => {
                                            const selected = formData.serviceIds.includes(service.service_id);
                                            return (
                                                <button
                                                    key={service.service_id}
                                                    type="button"
                                                    onClick={() => toggleItem('serviceIds', service.service_id)}
                                                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                                                        selected
                                                            ? 'border-emerald-400 bg-emerald-50'
                                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            {service.icon && (
                                                                <i className={`${service.icon} text-sm shrink-0 ${selected ? 'text-emerald-600' : 'text-gray-400'}`} />
                                                            )}
                                                            <span className={`text-sm font-semibold truncate ${selected ? 'text-emerald-700' : 'text-gray-800'}`}>
                                                                {service.name}
                                                            </span>
                                                        </div>
                                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ml-1 transition-colors ${
                                                            selected ? 'bg-emerald-500' : 'bg-gray-100'
                                                        }`}>
                                                            {selected && <FiCheck size={9} className="text-white" />}
                                                        </div>
                                                    </div>
                                                    {service.description && (
                                                        <p className={`text-[11px] leading-tight line-clamp-1 ${selected ? 'text-emerald-500' : 'text-gray-400'}`}>
                                                            {service.description}
                                                        </p>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {availableServices.length > 6 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAllServices(!showAllServices)}
                                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                                        >
                                            {showAllServices
                                                ? <><FiChevronUp size={13} /> Show fewer</>
                                                : <><FiChevronDown size={13} /> Show all {availableServices.length} services</>
                                            }
                                        </button>
                                    )}
                                    </>
                                )}
                                <FieldError message={errors.serviceIds} />
                            </section>

                            {/* ── Photos (add mode only) ── */}
                            {!isEditMode && (
                                <section>
                                    <SectionHeader Icon={FiCamera} label="Photos" />
                                    <p className="text-xs text-gray-400 mb-3 -mt-2">Add up to 5 photos — the first will be the cover</p>

                                    {errors.images && (
                                        <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                            <FiAlertCircle size={13} className="text-red-500 shrink-0" />
                                            <p className="text-xs text-red-600">{errors.images}</p>
                                        </div>
                                    )}

                                    {selectedImages.length > 0 && (
                                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-3">
                                            {selectedImages.map((file, idx) => (
                                                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                                    <img src={URL.createObjectURL(file)} alt="" className="object-cover w-full h-full" />
                                                    {idx === 0 && (
                                                        <span className="absolute top-1.5 left-1.5 bg-emerald-600 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold text-white tracking-wide z-10">
                                                            Cover
                                                        </span>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                                                            className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                                                        >
                                                            <FiX size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedImages.length < 5 && (
                                        <div
                                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                            onDragLeave={() => setIsDragging(false)}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all group ${
                                                isDragging
                                                    ? 'border-emerald-400 bg-emerald-50'
                                                    : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors ${
                                                isDragging ? 'bg-emerald-100' : 'bg-gray-100 group-hover:bg-emerald-100'
                                            }`}>
                                                <FiUpload size={20} className={`transition-colors ${
                                                    isDragging ? 'text-emerald-500' : 'text-gray-400 group-hover:text-emerald-500'
                                                }`} />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-700 mb-0.5">
                                                Drop photos here or{' '}
                                                <span className="text-emerald-600">browse files</span>
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {selectedImages.length > 0
                                                    ? `${5 - selectedImages.length} more photo${5 - selectedImages.length !== 1 ? 's' : ''} remaining`
                                                    : 'JPG, PNG or WEBP · Max 5 images'}
                                            </p>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        processFiles(e.target.files);
                                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </section>
                            )}
                        </form>

                        {/* ── Manage Photos (edit mode only) ── */}
                        {isEditMode && (
                            <div className="px-6 pb-6">
                                <SectionHeader Icon={FiCamera} label="Photos" />
                                <ImageManager entityType="hostels" entityId={hostelId} />
                            </div>
                        )}
                    </div>

                {/* Sticky footer */}
                <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
                        <p className="text-xs text-gray-400 hidden sm:block">
                            <span className="text-red-400">*</span> Required fields
                        </p>
                        <div className="flex items-center gap-3 ml-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="hostel-form"
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-60 transition-all shadow-sm hover:shadow-emerald-100 hover:shadow-md"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Saving…
                                    </>
                                ) : (
                                    <>
                                        <FiCheck size={15} />
                                        {isEditMode ? 'Save Changes' : 'Create Hostel'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
            </div>
        </div>
    );
}
