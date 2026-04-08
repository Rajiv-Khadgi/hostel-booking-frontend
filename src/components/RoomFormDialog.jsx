import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import api from '../api/axios';
import {
    FiHome, FiX, FiCheck, FiAlertCircle,
    FiUser, FiUsers, FiGrid, FiHash,
    FiTag, FiDollarSign, FiEdit2
} from 'react-icons/fi';

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
    room_number: Yup.string().required('Room number is required')
});

const ROOM_TYPES = [
    { value: 'SINGLE', label: 'Single', sublabel: '1 bed', Icon: FiUser },
    { value: 'DOUBLE', label: 'Double', sublabel: '2 beds', Icon: FiUsers },
    { value: 'TRIPLE', label: 'Triple', sublabel: '3 beds', Icon: FiUsers },
    { value: 'DORM', label: 'Dorm', sublabel: 'Shared', Icon: FiGrid },
];

function SectionHeader({ Icon, label }) {
    return (
        <div className="flex items-center gap-3 mb-4">
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

const inputClass = (error) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
        error
            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
            : 'border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-400'
    }`;

export default function RoomFormDialog({ isOpen, onClose, onSuccess, defaultHostelId, roomId, roomData }) {
    const isEditMode = !!roomId;

    const [hostels, setHostels] = useState([]);
    const [formData, setFormData] = useState({
        hostel_id: defaultHostelId || '',
        room_type: 'SINGLE',
        total_beds: 1,
        available_beds: 1,
        price: '',
        room_number: ''
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Fetch hostels + room data when opened
    useEffect(() => {
        if (!isOpen) return;

        // Edit mode with pre-loaded data: populate instantly, no API call needed
        if (isEditMode && roomData) {
            setFormData({
                hostel_id: roomData.hostel_id || '',
                room_type: roomData.room_type || 'SINGLE',
                total_beds: roomData.total_beds || 1,
                available_beds: roomData.available_beds || 1,
                price: Number(roomData.price) || '',
                room_number: roomData.room_number || ''
            });
            return;
        }

        const fetchData = async () => {
            setDataLoading(true);
            try {
                const requests = [
                    api.get('/hostels/my-hostels'),
                    ...(roomId && !roomData ? [api.get(`/rooms/${roomId}`)] : [])
                ];
                const results = await Promise.all(requests);
                const list = results[0].data.hostels || [];
                setHostels(list);

                if (roomId && !roomData && results[1]) {
                    const room = results[1].data.room;
                    setFormData({
                        hostel_id: room.hostel_id || '',
                        room_type: room.room_type || 'SINGLE',
                        total_beds: room.total_beds || 1,
                        available_beds: room.available_beds || 1,
                        price: Number(room.price) || '',
                        room_number: room.room_number || ''
                    });
                } else {
                    if (defaultHostelId) {
                        setFormData(prev => ({ ...prev, hostel_id: defaultHostelId }));
                    } else if (list.length > 0) {
                        setFormData(prev => ({ ...prev, hostel_id: list[0].hostel_id }));
                    }
                }
            } catch {
                setServerError('Failed to load required data.');
            } finally {
                setDataLoading(false);
            }
        };
        fetchData();
    }, [isOpen, roomId, roomData, defaultHostelId]);

    // Reset form when closed
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                hostel_id: defaultHostelId || '',
                room_type: 'SINGLE',
                total_beds: 1,
                available_beds: 1,
                price: '',
                room_number: ''
            });
            setErrors({});
            setServerError('');
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const setRoomType = (value) => {
        setFormData(prev => ({ ...prev, room_type: value }));
        if (errors.room_type) setErrors(prev => ({ ...prev, room_type: '' }));
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
                await api.put(`/rooms/${roomId}`, formData);
            } else {
                await api.post('/rooms', formData);
            }
            onSuccess?.();
            onClose();
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const ve = {};
                err.inner.forEach(e => { ve[e.path] = e.message; });
                setErrors(ve);
            } else {
                setServerError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} room.`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const occupiedBeds = Number(formData.total_beds) - Number(formData.available_beds);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
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
                            {isEditMode ? 'Edit Room' : 'Add New Room'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {isEditMode ? 'Update pricing and occupancy details' : 'Create a room listing for your property'}
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
                {dataLoading ? (
                    <div className="flex-1 flex items-center justify-center py-16">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-400">Loading…</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        {serverError && (
                            <div className="mx-6 mt-5 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
                                <FiAlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600 font-medium">{serverError}</p>
                            </div>
                        )}

                        <form id="room-form" onSubmit={handleSubmit} className="px-6 py-6 space-y-7">

                            {/* ── Room Details ── */}
                            <section>
                                <SectionHeader Icon={FiHash} label="Room Details" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Property<span className="text-red-400 ml-0.5">*</span>
                                        </label>
                                        <div className="relative">
                                            <FiHome size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            <select
                                                name="hostel_id"
                                                value={formData.hostel_id}
                                                onChange={handleChange}
                                                disabled={isEditMode}
                                                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all appearance-none ${
                                                    isEditMode
                                                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                                        : 'bg-gray-50 focus:bg-white border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-400'
                                                }`}
                                            >
                                                <option value="" disabled>Select a hostel</option>
                                                {hostels.map(h => (
                                                    <option key={h.hostel_id} value={h.hostel_id}>{h.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Room Number / Name<span className="text-red-400 ml-0.5">*</span>
                                        </label>
                                        <div className="relative">
                                            <FiHash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            <input
                                                type="text"
                                                name="room_number"
                                                value={formData.room_number}
                                                onChange={handleChange}
                                                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm bg-gray-50 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                                                    errors.room_number
                                                        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
                                                        : 'border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-400'
                                                }`}
                                                placeholder="E.g., 101 or A-1"
                                            />
                                        </div>
                                        <FieldError message={errors.room_number} />
                                    </div>
                                </div>
                            </section>

                            {/* ── Room Type ── */}
                            <section>
                                <SectionHeader Icon={FiTag} label="Room Type" />
                                <div className="grid grid-cols-4 gap-2.5">
                                    {ROOM_TYPES.map(({ value, label, sublabel, Icon }) => {
                                        const active = formData.room_type === value;
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setRoomType(value)}
                                                className={`flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl border-2 transition-all ${
                                                    active
                                                        ? 'border-emerald-500 bg-emerald-50'
                                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <Icon size={18} className={active ? 'text-emerald-600' : 'text-gray-400'} />
                                                <span className={`text-xs font-semibold leading-none ${active ? 'text-emerald-700' : 'text-gray-600'}`}>{label}</span>
                                                <span className={`text-[10px] leading-none ${active ? 'text-emerald-400' : 'text-gray-400'}`}>{sublabel}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <FieldError message={errors.room_type} />
                            </section>

                            {/* ── Pricing ── */}
                            <section>
                                <SectionHeader Icon={FiDollarSign} label="Pricing" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Monthly Rent (NPR)<span className="text-red-400 ml-0.5">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-sm font-semibold text-gray-400">Rs.</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className={`w-full pl-12 pr-4 py-2.5 rounded-xl border text-sm bg-gray-50 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                                                errors.price
                                                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
                                                    : 'border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-400'
                                            }`}
                                            placeholder="E.g., 15000"
                                        />
                                    </div>
                                    <FieldError message={errors.price} />
                                </div>
                            </section>

                            {/* ── Occupancy ── */}
                            <section>
                                <SectionHeader Icon={FiUsers} label="Occupancy" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Total Beds<span className="text-red-400 ml-0.5">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="total_beds"
                                            value={formData.total_beds}
                                            onChange={(e) => {
                                                handleChange(e);
                                                if (!isEditMode) {
                                                    setFormData(prev => ({ ...prev, available_beds: e.target.value }));
                                                }
                                                if (errors.total_beds) setErrors(prev => ({ ...prev, total_beds: '' }));
                                            }}
                                            className={inputClass(errors.total_beds)}
                                            min="1"
                                        />
                                        <FieldError message={errors.total_beds} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Available Beds<span className="text-red-400 ml-0.5">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="available_beds"
                                            value={formData.available_beds}
                                            onChange={handleChange}
                                            className={inputClass(errors.available_beds)}
                                            min="0"
                                        />
                                        <FieldError message={errors.available_beds} />
                                    </div>
                                </div>

                                {Number(formData.total_beds) > 0 && !errors.available_beds && (
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all"
                                                style={{ width: `${Math.min(100, (occupiedBeds / Number(formData.total_beds)) * 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                                            {occupiedBeds >= 0 ? occupiedBeds : 0} of {formData.total_beds} occupied
                                        </span>
                                    </div>
                                )}
                            </section>

                        </form>

                    </div>
                )}

                {/* Sticky footer */}
                {!dataLoading && (
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
                                form="room-form"
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
                                        {isEditMode ? 'Save Changes' : 'Add Room'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
