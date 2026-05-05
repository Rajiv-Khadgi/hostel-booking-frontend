import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import api from '../api/axios';
import { FiMail, FiCheckCircle, FiArrowRight, FiKey } from 'react-icons/fi';

const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
});

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await forgotPasswordSchema.validate({ email });
            setIsSubmitting(true);

            await api.post('/forgot-password', { email });

            setSuccess(true);
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                setError(err.message);
            } else {
                setError(err.response?.data?.error || 'Failed to process request. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-gray-50 to-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-gray-900 relative">
            
            {/* Ambient Background decoration */}
            <div className="absolute top-0 left-1/2 -ml-[30rem] w-[60rem] h-[60rem] bg-emerald-100/40 rounded-full blur-3xl mix-blend-multiply opacity-50 pointer-events-none"></div>

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
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Check your email</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed max-w-[16rem] mx-auto">
                                We've sent a secure password reset link to <br />
                                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-2 inline-block border border-emerald-100/50">{email}</span>
                            </p>
                            <Link
                                to="/login"
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all hover:shadow-md"
                            >
                                Return to login
                            </Link>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-500">
                            <div className="text-center mb-8">
                                <div className="mx-auto inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-6 shadow-sm border border-emerald-100/50">
                                    <FiKey className="w-7 h-7" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Forgot password?</h2>
                                <p className="text-sm text-gray-500">
                                    No worries, we'll send you reset instructions.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4 rounded-r-xl animate-in slide-in-from-top-2">
                                    <div className="flex items-center">
                                        <p className="text-sm text-red-700 font-medium">{error}</p>
                                    </div>
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-300">
                                            <FiMail className="h-5 w-5" />
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError('');
                                            }}
                                            className={`appearance-none block w-full pl-12 pr-4 py-3.5 border ${error ? 'border-red-300 ring-2 ring-red-500/20' : 'border-gray-200'} rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-[15px] outline-none`}
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="group relative w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-[15px] font-bold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-lg overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center">
                                            {isSubmitting ? 'Sending link...' : 'Send reset link'}
                                            {!isSubmitting && <FiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                        </span>
                                    </button>
                                </div>
                            </form>
                            
                            <div className="mt-8 text-center">
                                <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors inline-flex items-center">
                                    ← Back to sign in
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
