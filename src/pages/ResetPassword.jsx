import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';
import api from '../api/axios';
import { FiLock, FiCheckCircle, FiArrowRight, FiKey } from 'react-icons/fi';

const resetPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
        .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain at least one symbol'),
    confirm_password: Yup.string()
        .required('Confirm password is required')
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
});

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [formData, setFormData] = useState({ password: '', confirm_password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token || !email) {
            setError('Invalid password reset link. Please request a new one.');
            return;
        }

        try {
            await resetPasswordSchema.validate(formData, { abortEarly: false });
            setIsSubmitting(true);

            await api.post('/reset-password', {
                email,
                token,
                password: formData.password
            });

            setSuccess(true);
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                setError(err.inner[0].message);
            } else {
                setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-gray-50 to-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-gray-900 relative">
            
            {/* Ambient Background decoration */}
            <div className="absolute top-0 right-1/2 ml-[30rem] w-[60rem] h-[60rem] bg-emerald-100/40 rounded-full blur-3xl mix-blend-multiply opacity-50 pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-block text-3xl font-extrabold tracking-tight text-emerald-900 hover:opacity-80 transition-opacity">
                        Home<span className="text-emerald-500">Space</span>.
                    </Link>
                </div>

                <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl shadow-emerald-900/10 border border-white sm:rounded-3xl sm:px-12 relative overflow-hidden">
                    {/* Inner glowing edge decoration */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-300 to-emerald-500"></div>

                    {success ? (
                        <div className="animate-in fade-in zoom-in-95 duration-500 text-center py-4">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-emerald-50 mb-6 border border-emerald-100 shadow-sm relative">
                                <div className="absolute inset-0 bg-emerald-100 rounded-2xl animate-ping opacity-20"></div>
                                <FiCheckCircle className="h-10 w-10 text-emerald-600 relative z-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Password Reset</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed max-w-[17rem] mx-auto">
                                You have successfully secured your account. You can now sign in below.
                            </p>
                            <Link
                                to="/login"
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-[15px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all hover:shadow-md"
                            >
                                Continue to login
                                <FiArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-500">
                            <div className="text-center mb-8">
                                <div className="mx-auto inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-6 shadow-sm border border-emerald-100/50">
                                    <FiKey className="w-7 h-7" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Create new password</h2>
                                <p className="text-sm text-gray-500">
                                    Set a strong password for your digital home.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4 rounded-r-xl animate-in slide-in-from-top-2">
                                    <div className="flex items-center">
                                        <p className="text-sm text-red-700 font-medium">{error}</p>
                                    </div>
                                </div>
                            )}

                            {(!token || !email) && !error && (
                                <div className="mb-6 border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-xl">
                                    <p className="text-sm text-yellow-700 font-medium leading-relaxed">
                                        Invalid password reset link. Please try requesting a new link.
                                    </p>
                                    <Link to="/forgot-password" className="inline-flex items-center mt-3 text-sm font-bold text-yellow-800 hover:text-yellow-600 transition-colors">
                                        Request new link <FiArrowRight className="ml-1.5 w-4 h-4" />
                                    </Link>
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-300">
                                            <FiLock className="h-5 w-5" />
                                        </div>
                                        <input
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`appearance-none block w-full pl-12 pr-4 py-3.5 border ${error.includes('Password is') || error.includes('contain') ? 'border-red-300 ring-2 ring-red-500/20' : 'border-gray-200'} rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-[15px] outline-none`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="mt-2 text-[11px] text-gray-400 leading-tight space-y-1 pl-1">
                                        <p>• Min. 6 characters</p>
                                        <p>• 1 Uppercase, 1 Number, 1 Symbol</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-300">
                                            <FiLock className="h-5 w-5" />
                                        </div>
                                        <input
                                            name="confirm_password"
                                            type="password"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            className={`appearance-none block w-full pl-12 pr-4 py-3.5 border ${error.includes('match') ? 'border-red-300 ring-2 ring-red-500/20' : 'border-gray-200'} rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-[15px] outline-none`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !token || !email}
                                        className="group relative w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-[15px] font-bold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-lg overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center">
                                            {isSubmitting ? 'Resetting password...' : 'Reset password'}
                                            {!isSubmitting && <FiCheckCircle className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />}
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
