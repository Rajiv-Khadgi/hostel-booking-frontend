import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import api from '../api/axios';

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
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl mx-auto flex items-center justify-center font-bold text-3xl shadow-sm">
                    H
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Reset password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Remembered your password?{' '}
                    <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                        Back to sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">

                    {success ? (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
                                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                We've sent a password reset link to <span className="font-medium text-gray-900">{email}</span>.
                            </p>
                            <Link
                                to="/login"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-all hover:shadow-md"
                            >
                                Return to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4">
                                    <p className="text-sm text-red-600 text-center font-medium">{error}</p>
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email address
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Enter the email address associated with your account and we'll send you a link to reset your password.
                                    </p>
                                    <input
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError('');
                                        }}
                                        className={`appearance-none block w-full px-4 py-3 border ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'
                                            } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                                        placeholder="you@university.edu"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-all hover:shadow-md"
                                    >
                                        {isSubmitting ? 'Sending link...' : 'Send reset link'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
