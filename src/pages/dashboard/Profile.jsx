import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { getImageUrl } from '../../utils/hostelUtils';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        middle_name: user?.middle_name || '',
        last_name: user?.last_name || '',
        phone: user?.phone || '',
        dob: user?.dob || '',
        gender: user?.gender || '',
        institute: user?.institute || '',
        recommendations: user?.recommendations || '',
    });

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append('profile_image', file);

        try {
            setLoading(true);
            const res = await api.put('/profile', data);
            updateUser(res.data.user);
            setMsg({ type: 'success', text: 'Profile picture updated!' });
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.error || 'Upload failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.phone) {
            // Check if phone contains only digits and is exactly 10 digits
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(formData.phone)) {
                setMsg({ type: 'error', text: 'Phone number must be exactly 10 positive digits' });
                return;
            }
        }

        try {
            setLoading(true);
            const res = await api.put('/profile', formData);
            updateUser(res.data.user);
            setMsg({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.error || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    const getAvatarUrl = () => {
        if (user?.profile_image) {
            return getImageUrl(user.profile_image, api.defaults.baseURL);
        }
        return `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.middle_name ? user.middle_name + '+' : ''}${user?.last_name}&background=10b981&color=fff&size=200`;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
                <p className="text-gray-500 mt-1 text-sm">Manage your personal information and security settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
                        <div className="relative inline-block group mb-6">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-emerald-50 shadow-inner bg-gray-100 mx-auto">
                                <img
                                    src={getAvatarUrl()}
                                    alt="Profile"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-1 right-1 bg-emerald-600 text-white p-2.5 rounded-full shadow-lg hover:bg-emerald-700 transition-all scale-90 sm:scale-100 hover:scale-110 border-2 border-white"
                                title="Change Avatar"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-gray-900">{user?.first_name} {user?.middle_name ? user.middle_name + ' ' : ''}{user?.last_name}</h2>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                            <span className="inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Information Form */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                        </h3>

                        {msg.text && (
                            <div className={`mb-6 p-4 rounded-xl text-sm border flex items-center gap-3 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                {msg.type === 'success' ? (
                                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                {msg.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                    placeholder="Enter your first name"
                                    required
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Middle Name</label>
                                <input
                                    type="text"
                                    name="middle_name"
                                    value={formData.middle_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                    placeholder="Middle name (optional)"
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                    placeholder="Enter your last name"
                                    required
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                    placeholder="+977-98XXXXXXXX"
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm appearance-none"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Institute / College</label>
                                <input
                                    type="text"
                                    name="institute"
                                    value={formData.institute}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                    placeholder="e.g. Tribhuvan University"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Recommendations / Additional Info</label>
                                <textarea
                                    name="recommendations"
                                    value={formData.recommendations}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                    placeholder="Any specific preferences or recommendations..."
                                />
                            </div>

                            <div className="sm:col-span-2 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                >
                                    {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm opacity-60">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Account Security
                        </h3>
                        <p className="text-sm text-gray-500">Email and role changes are restricted. Please contact support if you need to modify these.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
